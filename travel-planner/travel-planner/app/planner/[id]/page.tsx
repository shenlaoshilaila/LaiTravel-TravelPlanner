// app/itinerary/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { POI, DayPOI } from "@/components/types";
import { groupPOIsByDay } from "@/components/utils/groupByDay";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string | string[] };
}

type ItineraryResponse = { id: string | number; city: string; pois: POI[] };

// ---- Config ----
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const SHOW_PATH = "/api/itinerary";
const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY; // server-only key

// We only support DRIVING in the UI (car icon)
type Mode = "driving";
const MODE: Mode = "driving";

// ---- Utils ----
const EPS_KM = 0.03; // 30 m

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const c =
      2 *
      Math.atan2(
          Math.sqrt(s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2),
          Math.sqrt(1 - (s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2))
      );
  return R * c;
}
function isSameSpot(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return haversineKm(a, b) < EPS_KM;
}

function fmtKm(meters?: number): string {
  if (typeof meters !== "number") return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function fmtDurationRFC3339(d?: string): string {
  if (!d) return "—";
  const secMatch = d.match(/^(\d+)s$/i);
  let total = 0;
  if (secMatch) {
    total = parseInt(secMatch[1], 10);
  } else {
    const h = /(\d+)H/.exec(d)?.[1];
    const m = /(\d+)M/.exec(d)?.[1];
    const s = /(\d+)S/.exec(d)?.[1];
    total = (h ? +h * 3600 : 0) + (m ? +m * 60 : 0) + (s ? +s : 0);
  }
  const hrs = Math.floor(total / 3600);
  const mins = Math.round((total % 3600) / 60);
  return hrs ? `${hrs} hr ${mins} min` : `${mins} min`;
}

type LegInfo = { distanceText: string; durationText: string };
type LegsResult = { legs: LegInfo[]; error?: string };

// ---- 1) Routes API (primary) ----
async function fetchLegViaRoutes(
    origin: { lat: number; lng: number },
    dest: { lat: number; lng: number },
    apiKey: string
): Promise<LegInfo> {
  if (isSameSpot(origin, dest)) {
    return { distanceText: "0 m", durationText: "same location" };
  }

  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
  const body = {
    origin:      { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
    destination: { location: { latLng: { latitude: dest.lat,   longitude: dest.lng   } } },
    travelMode:  "DRIVE",
    computeTravelSummary: true,
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Routes HTTP ${r.status}: ${text || "unknown error"}`);
  }

  const data = await r.json();
  const route = data?.routes?.[0];
  const meters = route?.distanceMeters as number | undefined;
  const duration = route?.duration as string | undefined;

  if (meters == null || !duration) {
    throw new Error("Routes: missing distance/duration");
  }

  return { distanceText: fmtKm(meters), durationText: fmtDurationRFC3339(duration) };
}

// ---- 2) Distance Matrix (fallback) ----
async function fetchLegViaDistanceMatrix(
    origin: { lat: number; lng: number },
    dest: { lat: number; lng: number },
    apiKey: string
): Promise<LegInfo> {
  if (isSameSpot(origin, dest)) {
    return { distanceText: "0 m", durationText: "same location" };
  }

  const params = new URLSearchParams({
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${dest.lat},${dest.lng}`,
    mode: "driving",
    key: apiKey,
  });

  const r = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`);
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`DM HTTP ${r.status}: ${text || "unknown error"}`);
  }

  const data = await r.json();
  const el = data?.rows?.[0]?.elements?.[0];
  const distText = el?.distance?.text as string | undefined;
  const durText  = el?.duration?.text as string | undefined;

  if (!distText || !durText) {
    throw new Error(`DM: bad element ${JSON.stringify(el)}`);
  }

  return { distanceText: distText, durationText: durText };
}

// ---- Orchestrator with fallback ----
async function getLegsDistanceTime(pois: POI[]): Promise<LegsResult> {
  const coords = pois.filter(p => typeof p.lat === "number" && typeof p.lng === "number");
  const empty: LegsResult = {
    legs: Array(Math.max(0, coords.length - 1)).fill({ distanceText: "—", durationText: "—" }),
  };

  if (!GMAPS_KEY) return { ...empty, error: "GOOGLE_MAPS_API_KEY missing" };
  if (coords.length < 2) return empty;

  try {
    const tasks = coords.slice(0, -1).map(async (o, i) => {
      const a = { lat: o.lat as number,           lng: o.lng as number };
      const b = { lat: coords[i + 1].lat as number, lng: coords[i + 1].lng as number };

      try {
        return await fetchLegViaRoutes(a, b, GMAPS_KEY);
      } catch {
        // fallback to Distance Matrix
        try {
          return await fetchLegViaDistanceMatrix(a, b, GMAPS_KEY);
        } catch {
          return { distanceText: "—", durationText: "—" };
        }
      }
    });

    const legs = await Promise.all(tasks);
    return { legs };
  } catch (e: any) {
    return { ...empty, error: String(e?.message || e) };
  }
}

// ---- Page ----
export default async function Page({ params }: PageProps) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const jwt = cookieStore.get("jwt")?.value;

  const url = `${API_BASE}${SHOW_PATH}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      Accept: "application/json",
    },
  });

  if (res.status === 404) notFound();
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch itinerary (${res.status}): ${text || "unknown"}`);
  }

  let data: Partial<ItineraryResponse> = {};
  try { data = (await res.json()) as Partial<ItineraryResponse>; } catch {}

  const city = data.city ?? "Beijing";
  const pois: POI[] = Array.isArray(data.pois) ? data.pois : [];
  const byDay: DayPOI[] = groupPOIsByDay(pois);

  // compute distances/times per day (server-side)
  const resultsPerDay = await Promise.all(byDay.map(d => getLegsDistanceTime(d.pois)));

  return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">This is your plan</h1>
          <span className="text-gray-600">{city}</span>
        </header>

        {byDay.map(({ day, pois }, idx) => {
          const result = resultsPerDay[idx];
          const legs = result?.legs ?? [];

          return (
              <section key={day} className="rounded-xl border p-4 bg-white">
                <h2 className="font-medium mb-3">Day {day}</h2>

                {result?.error && (
                    <p className="mb-3 text-sm text-amber-700">Maps: {result.error}</p>
                )}

                {pois.length === 0 ? (
                    <p className="text-sm text-gray-500">No POIs for this day.</p>
                ) : (
                    <ol className="list-decimal pl-5 space-y-2">
                      {pois.map((p, i) => (
                          <li key={i} className="text-gray-800">
                            <div>
                      <span>
                        {p.name}
                        {typeof p.lat === "number" && typeof p.lng === "number" && (
                            <span className="text-gray-500 text-sm">
                            {" "}({p.lat.toFixed(5)}, {p.lng.toFixed(5)})
                          </span>
                        )}
                      </span>
                            </div>

                            {/* segment line with car icon (time · distance) */}
                            {i < pois.length - 1 && (
                                isSameSpot(pois[i], pois[i + 1]) ? (
                                    <div className="ml-6 text-sm text-blue-600">same location</div>
                                ) : (
                                    <div className="ml-6 list-none flex items-center text-blue-600 text-sm">
                                      <span className="inline-block mr-2">🚗</span>
                                      <span>{legs[i]?.durationText ?? "—"}</span>
                                      <span className="mx-1">·</span>
                                      <span>{legs[i]?.distanceText ?? "—"}</span>
                                    </div>
                                )
                            )}
                          </li>
                      ))}
                    </ol>
                )}

                {!GMAPS_KEY && (
                    <p className="mt-3 text-xs text-amber-600">
                      Tip: add <code>GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code> and enable
                      <strong> Routes API</strong> (and optionally Distance Matrix) in Google Cloud.
                    </p>
                )}
              </section>
          );
        })}
      </div>
  );
}

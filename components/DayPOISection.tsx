"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import SearchPOI from "./SearchPOI";
import { POI } from "./types";
import { Autocomplete } from "@react-google-maps/api";

interface Props {
  day: number;                  // Day index (1,2,3...) - still useful as unique ID
  date: string;                 // ✅ actual calendar date (YYYY-MM-DD)
  initialPois: POI[];
  city?: string;
  itineraryId?: string;
  isActive: boolean;
  onUpdatePois: (day: number, next: POI[]) => void;
  onSelectDay: (day: number) => void;
  onCityChange: (day: number, city: string) => void;
  backendUrl: string;
}

const MODE = process.env.NEXT_PUBLIC_DISTANCE_MODE ?? "mock";

type SegInfo = {
  durationText: string;
  distanceText: string;
};

const EPS_KM = 0.03;

// --- Haversine utilities ---
function haversineKm(p1: POI, p2: POI): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function isSameSpot(a: POI, b: POI) {
  return haversineKm(a, b) < EPS_KM;
}

function haversineMinutes(p1: POI, p2: POI): number {
  const distanceKm = haversineKm(p1, p2);
  const avgKmh = 40;
  const mins = (distanceKm / avgKmh) * 60;
  if (distanceKm < 0.03) return 0;
  if (distanceKm < 0.15) return 1;
  return Math.max(1, Math.round(mins));
}

function segKey(p1: POI, p2: POI) {
  return `${p1.lat},${p1.lng}|${p2.lat},${p2.lng}`;
}

// --- Fetch segment info from backend or fallback ---
async function fetchSegInfo(p1: POI, p2: POI, backendUrl: string): Promise<SegInfo> {
  if (isSameSpot(p1, p2)) {
    return { durationText: "0 min", distanceText: "0.0 km" };
  }

  if (MODE === "mock") {
    return {
      durationText: `${haversineMinutes(p1, p2)} min drive`,
      distanceText: `${haversineKm(p1, p2).toFixed(1)} km`,
    };
  }

  try {
    const res = await fetch(
        MODE === "nextapi" ? "/api/distance" : `${backendUrl}/api/distance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origins: [{ lat: p1.lat, lng: p1.lng }],
            destinations: [{ lat: p2.lat, lng: p2.lng }],
            mode: "DRIVING",
          }),
        }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const el = json?.rows?.[0]?.elements?.[0];

    const durationText =
        el?.duration?.text ??
        el?.travelDurationText ??
        (el?.duration?.value
            ? `${Math.round(el.duration.value / 60)} min drive`
            : null);

    const distanceText =
        el?.distance?.text ??
        (el?.distance?.value ? `${(el.distance.value / 1000).toFixed(1)} km` : null);

    return {
      durationText: durationText ?? `${haversineMinutes(p1, p2)} min drive`,
      distanceText: distanceText ?? `${haversineKm(p1, p2).toFixed(1)} km`,
    };
  } catch {
    return {
      durationText: `${haversineMinutes(p1, p2)} min drive`,
      distanceText: `${haversineKm(p1, p2).toFixed(1)} km`,
    };
  }
}

// --- Component ---
export default function DayPOISection({
                                        day,
                                        date,
                                        initialPois,
                                        city,
                                        itineraryId,
                                        onUpdatePois,
                                        onSelectDay,
                                        onCityChange,
                                        isActive = false,
                                        backendUrl,
                                      }: Props) {
  const pois = initialPois;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [segInfoMap, setSegInfoMap] = useState<Record<string, SegInfo>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  // --- Segment calculations ---
  const segments = useMemo(() => {
    const arr: Array<{ from: POI; to: POI; k: string }> = [];
    for (let i = 0; i < pois.length - 1; i++) {
      const from = pois[i];
      const to = pois[i + 1];
      if (!isSameSpot(from, to)) arr.push({ from, to, k: segKey(from, to) });
    }
    return arr;
  }, [pois]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const s of segments) {
        if (segInfoMap[s.k]) continue;
        setLoadingKeys((m) => ({ ...m, [s.k]: true }));
        const info = await fetchSegInfo(s.from, s.to, backendUrl);
        if (cancelled) return;
        setSegInfoMap((m) => ({ ...m, [s.k]: info }));
        setLoadingKeys((m) => {
          const { [s.k]: _, ...rest } = m;
          return rest;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [segments, backendUrl]);

  // --- When a POI is picked ---
  const handlePick = (picked: { name: string; lat: number; lng: number }) => {
    const newPoi: POI = {
      name: picked.name,
      lat: picked.lat,
      lng: picked.lng,
      sequence: pois.length,
      day,
      date, // ✅ carry actual date with each POI
    };
    onUpdatePois(day, [...pois, newPoi]);
  };

  return (
      <div className={`rounded border p-4 ${isActive ? "bg-blue-50" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-3">
          {/* ✅ Show actual calendar date */}
          <h3 className="font-semibold">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          <button className="text-sm opacity-70" onClick={() => onSelectDay(day)}>
            {isActive ? "Active" : "Set Active"}
          </button>
        </div>

        {/* ✅ City Input with Google Autocomplete */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Select City:</label>
          <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={() => {
                const place = autocompleteRef.current?.getPlace();
                if (place?.formatted_address) {
                  onCityChange(day, place.formatted_address);
                } else if (place?.name) {
                  onCityChange(day, place.name);
                }
              }}
          >
            <input
                type="text"
                defaultValue={city ?? ""}
                placeholder="e.g. Shanghai, China"
                className="border px-2 py-1 rounded w-full"
            />
          </Autocomplete>
        </div>

        {/* ✅ POI Search */}
        <SearchPOI city={city ?? ""} onPick={handlePick} placeholder="Search POI…" />

        {/* ✅ POI List with driving segments */}
        <ol className="mt-3 space-y-2 list-decimal pl-5">
          {pois.map((p, i) => {
            const hasNext = i < pois.length - 1;
            const next = hasNext ? pois[i + 1] : null;

            return (
                <React.Fragment key={`day-${day}-seq-${p.sequence}`}>
                  <li>{p.name}</li>

                  {hasNext && (
                      <li className="ml-2 list-none flex items-center text-blue-600 text-sm">
                        <span className="inline-block mr-2">🚗</span>
                        {next && isSameSpot(p, next) ? (
                            <span>same location</span>
                        ) : next ? (
                            loadingKeys[segKey(p, next)] ? (
                                <span className="opacity-70">calculating…</span>
                            ) : segInfoMap[segKey(p, next)] ? (
                                <span>
                        {segInfoMap[segKey(p, next)].durationText} ·{" "}
                                  {segInfoMap[segKey(p, next)].distanceText}
                      </span>
                            ) : (
                                <span />
                            )
                        ) : null}
                      </li>
                  )}
                </React.Fragment>
            );
          })}
        </ol>
      </div>
  );
}

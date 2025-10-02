"use client";

import React, { useMemo, useState, useEffect } from "react";
import SearchPOI from "./SearchPOI";
import { POI } from "./types";

interface Props {
  day: number;
  initialPois: POI[];
  city?: string; // ✅ make optional (can be empty at start)
  itineraryId?: string;
  isActive: boolean;
  onUpdatePois: (day: number, next: POI[]) => void;
  onSelectDay: (day: number) => void;
  onCityChange: (day: number, city: string) => void; // ✅ per-day city
  backendUrl: string;
}

const MODE = process.env.NEXT_PUBLIC_DISTANCE_MODE ?? "mock";

type SegInfo = {
  durationText: string;
  distanceText: string;
};

const EPS_KM = 0.03;

function haversineKm(p1: POI, p2: POI): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

async function fetchSegInfo(
    p1: POI,
    p2: POI,
    backendUrl: string
): Promise<SegInfo> {
  if (isSameSpot(p1, p2)) {
    return { durationText: "0 min", distanceText: "0.0 km" };
  }

  if (MODE === "mock") {
    const mins = haversineMinutes(p1, p2);
    const km = haversineKm(p1, p2);
    return { durationText: `${mins} min drive`, distanceText: `${km.toFixed(1)} km` };
  }

  const body = {
    origins: [{ lat: p1.lat, lng: p1.lng }],
    destinations: [{ lat: p2.lat, lng: p2.lng }],
    mode: "DRIVING",
  };

  try {
    const url = MODE === "nextapi" ? "/api/distance" : `${backendUrl}/api/distance`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const el = json?.rows?.[0]?.elements?.[0];

    let durationText: string | null =
        el?.duration?.text ?? el?.travelDurationText ?? null;
    if (!durationText) {
      const seconds = el?.duration?.value ?? el?.travelDuration?.value;
      if (typeof seconds === "number") {
        durationText = `${Math.max(0, Math.round(seconds / 60))} min drive`;
      }
    }

    let distanceText: string | null = el?.distance?.text ?? null;
    if (!distanceText) {
      const meters = el?.distance?.value;
      if (typeof meters === "number") {
        distanceText = `${(meters / 1000).toFixed(1)} km`;
      }
    }

    if (!durationText || !distanceText) {
      const mins = haversineMinutes(p1, p2);
      const km = haversineKm(p1, p2);
      return {
        durationText: durationText ?? `${mins} min drive`,
        distanceText: distanceText ?? `${km.toFixed(1)} km`,
      };
    }

    return { durationText, distanceText };
  } catch {
    const mins = haversineMinutes(p1, p2);
    const km = haversineKm(p1, p2);
    return { durationText: `${mins} min drive`, distanceText: `${km.toFixed(1)} km` };
  }
}

export default function DayPOISection({
                                        day,
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

  const [segInfoMap, setSegInfoMap] = useState<Record<string, SegInfo>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  const segments = useMemo(() => {
    const arr: Array<{ from: POI; to: POI; k: string }> = [];
    for (let i = 0; i < pois.length - 1; i++) {
      const from = pois[i];
      const to = pois[i + 1];
      if (isSameSpot(from, to)) continue;
      arr.push({ from, to, k: segKey(from, to) });
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

  const handlePick = (picked: { name: string; lat: number; lng: number }) => {
    const newPoi: POI = {
      name: picked.name,
      lat: picked.lat,
      lng: picked.lng,
      sequence: pois.length,
      day: day,
    };
    onUpdatePois(day, [...pois, newPoi]);
  };

  return (
      <div className={`rounded border p-4 ${isActive ? "bg-blue-50" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Day {day}</h3>
          <button className="text-sm opacity-70" onClick={() => onSelectDay(day)}>
            {isActive ? "Active" : "Set Active"}
          </button>
        </div>

        {/* ✅ Per-day city input */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Select City:</label>
          <input
              type="text"
              value={city ?? ""} // ✅ safe fallback
              onChange={(e) => onCityChange(day, e.target.value)}
              placeholder="e.g. Shanghai, China"
              className="border px-2 py-1 rounded w-full"
          />
        </div>

        <SearchPOI city={city ?? ""} onPick={handlePick} placeholder="Type e.g. 博物馆 / museum…" />

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

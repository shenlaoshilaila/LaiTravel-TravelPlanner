"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import SearchPOI from "./SearchPOI";
import { POI } from "./types";
import { Autocomplete } from "@react-google-maps/api";

interface Props {
    day: number;
    date?: string; // ✅ optional now
    initialPois: POI[];
    city?: string;
    itineraryId?: string;
    isActive: boolean;
    onUpdatePois: (day: number, next: POI[]) => void;
    onSelectDay: (day: number) => void;
    onCityChange: (day: number, city: string) => void;
    backendUrl: string;
}

type SegInfo = {
    durationText: string;
    distanceText: string;
};

const MODE = process.env.NEXT_PUBLIC_DISTANCE_MODE ?? "mock";
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

function segKey(p1: POI, p2: POI) {
    return `${p1.lat},${p1.lng}|${p2.lat},${p2.lng}`;
}

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
                {/* ✅ Show date if available, otherwise fallback to "Day N" */}
                <h3 className="font-semibold">
                    {date
                        ? new Date(date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : `Day ${day}`}
                </h3>
                <button className="text-sm opacity-70" onClick={() => onSelectDay(day)}>
                    {isActive ? "Active" : "Set Active"}
                </button>
            </div>

            {/* ✅ City input */}
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

            <SearchPOI city={city ?? ""} onPick={handlePick} placeholder="Search POI…" />

            <ol className="mt-3 space-y-2 list-decimal pl-5">
                {pois.map((p) => (
                    <li key={`day-${day}-seq-${p.sequence}`}>{p.name}</li>
                ))}
            </ol>
        </div>
    );
}

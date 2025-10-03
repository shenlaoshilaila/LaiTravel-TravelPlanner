"use client";
import React, { useEffect, useState } from "react";
import { POI } from "./types";

interface DayPOISectionProps {
    day: number;
    date?: string; // ✅ optional date
    city?: string; // ✅ optional city
    initialPois: POI[];
    onUpdatePois: (day: number, pois: POI[]) => void;
    onSelectDay: (day: number) => void;
    onCityChange: (day: number, city: string) => void;
    isActive: boolean;
    backendUrl: string;
}

interface DistanceInfo {
    from: string;
    to: string;
    driving: string;
    walking: string;
}

export default function DayPOISection({
                                          day,
                                          date,
                                          city,
                                          initialPois,
                                          onUpdatePois,
                                          onSelectDay,
                                          onCityChange,
                                          isActive,
                                      }: DayPOISectionProps) {
    const [distances, setDistances] = useState<DistanceInfo[]>([]);

    useEffect(() => {
        if (initialPois.length < 2 || !(window as any).google) return;

        const service = new google.maps.DistanceMatrixService();

        // Reset distances
        setDistances([]);

        initialPois.forEach((origin, i) => {
            if (i === initialPois.length - 1) return;
            const destination = initialPois[i + 1];

            // 🚗 Driving request
            service.getDistanceMatrix(
                {
                    origins: [{ lat: origin.lat, lng: origin.lng }],
                    destinations: [{ lat: destination.lat, lng: destination.lng }],
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (res, status) => {
                    if (status === "OK" && res?.rows[0]?.elements[0]) {
                        const drive = res.rows[0].elements[0];
                        setDistances((prev) => [
                            ...prev,
                            {
                                from: origin.name,
                                to: destination.name,
                                driving: `${drive.distance?.text ?? "?"} (${drive.duration?.text ?? "?"})`,
                                walking: "Loading...",
                            },
                        ]);
                    }
                }
            );

            // 🚶 Walking request
            service.getDistanceMatrix(
                {
                    origins: [{ lat: origin.lat, lng: origin.lng }],
                    destinations: [{ lat: destination.lat, lng: destination.lng }],
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (res, status) => {
                    if (status === "OK" && res?.rows[0]?.elements[0]) {
                        const walk = res.rows[0].elements[0];
                        setDistances((prev) =>
                            prev.map((d) =>
                                d.from === origin.name && d.to === destination.name
                                    ? {
                                        ...d,
                                        walking: `${walk.distance?.text ?? "?"} (${walk.duration?.text ?? "?"})`,
                                    }
                                    : d
                            )
                        );
                    }
                }
            );
        });
    }, [initialPois]);

    return (
        <div
            className={`p-4 border rounded mb-4 ${
                isActive ? "bg-blue-50 border-blue-400" : "bg-white"
            }`}
        >
            <h3 className="font-semibold">
                {/* ✅ Fallback if date is missing */}
                {date ? new Date(date).toDateString() : "No date"} — Day {day}{" "}
                {isActive && <span className="text-green-600">Active</span>}
            </h3>
            <p className="text-sm mb-2">City: {city ?? "Not selected"}</p>

            <ul className="space-y-1">
                {initialPois.map((poi, i) => (
                    <li key={i}>
                        {i + 1}. {poi.name}
                    </li>
                ))}
            </ul>

            {distances.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                    <h4 className="font-medium">Travel Info:</h4>
                    {distances.map((d, i) => (
                        <p key={i}>
                            {d.from} → {d.to}: 🚗 {d.driving}, 🚶 {d.walking}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}


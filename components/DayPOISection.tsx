"use client";
import React, { useEffect, useState } from "react";
import { POI } from "@/components/types";
import SearchPOI from "@/components/SearchPOI";

interface DayPOISectionProps {
    day: number;
    date: string;   // ✅ required now
    city: string;
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
        const newDistances: DistanceInfo[] = [];

        initialPois.forEach((origin, i) => {
            if (i === initialPois.length - 1) return;
            const destination = initialPois[i + 1];

            // 🚗 Driving
            service.getDistanceMatrix(
                {
                    origins: [{ lat: origin.lat, lng: origin.lng }],
                    destinations: [{ lat: destination.lat, lng: destination.lng }],
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (res, status) => {
                    if (status === "OK" && res?.rows[0]?.elements[0]) {
                        const drive = res.rows[0].elements[0];
                        newDistances.push({
                            from: origin.name,
                            to: destination.name,
                            driving: `${drive.distance?.text} (${drive.duration?.text})`,
                            walking: "Loading...",
                        });
                        setDistances([...newDistances]);
                    }
                }
            );

            // 🚶 Walking
            service.getDistanceMatrix(
                {
                    origins: [{ lat: origin.lat, lng: origin.lng }],
                    destinations: [{ lat: destination.lat, lng: destination.lng }],
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (res, status) => {
                    if (status === "OK" && res?.rows[0]?.elements[0]) {
                        const walk = res.rows[0].elements[0];
                        const idx = newDistances.findIndex(
                            (d) => d.from === origin.name && d.to === destination.name
                        );
                        if (idx !== -1) {
                            newDistances[idx].walking = `${walk.distance?.text} (${walk.duration?.text})`;
                            setDistances([...newDistances]);
                        }
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
            onClick={() => onSelectDay(day)}
        >
            <h3 className="font-semibold">
                {new Date(date).toDateString()} — Day {day}{" "}
                {isActive && <span className="text-green-600">Active</span>}
            </h3>

            {/* City Input */}
            <div className="mt-2">
                <label className="block text-sm font-medium">Select City:</label>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => onCityChange(day, e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                    placeholder="e.g. Shanghai, China"
                />
            </div>

            {/* POI Search */}
            {city && (
                <div className="mt-2">
                    <SearchPOI
                        city={city}
                        onPick={(poi: POI) => onUpdatePois(day, [...initialPois, poi])}
                        placeholder="Search POI..."
                    />
                </div>
            )}

            {/* List of POIs */}
            <ul className="space-y-1 mt-2">
                {initialPois.map((poi: POI, i: number) => (
                    <li key={i}>
                        {i + 1}. {poi.name}
                    </li>
                ))}
            </ul>

            {/* Distances */}
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

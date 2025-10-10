"use client";
import React, { useEffect, useRef, useState } from "react";
import SearchPOI from "./SearchPOI";
import { POI } from "./types";

interface DayPOISectionProps {
    day: number;
    date: string;
    city: string;
    initialPois: POI[];
    isActive: boolean;
    onSelectDay: (day: number) => void;
    onUpdatePois: (day: number, pois: POI[]) => void;
    onCityChange: (day: number, city: string) => void;
    backendUrl: string;
}

export default function DayPOISection({
                                          day,
                                          date,
                                          city,
                                          initialPois,
                                          isActive,
                                          onSelectDay,
                                          onUpdatePois,
                                          onCityChange,
                                          backendUrl,
                                      }: DayPOISectionProps) {
    const [pois, setPois] = useState<POI[]>(initialPois || []);
    const cityInputRef = useRef<HTMLInputElement | null>(null);

    // ✅ Google Places Autocomplete for city input
    useEffect(() => {
        if (!(window as any).google || !cityInputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(cityInputRef.current, {
            types: ["(cities)"], // restrict to cities
            fields: ["formatted_address", "geometry", "name"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
                onCityChange(day, place.formatted_address);
            } else if (place && place.name) {
                onCityChange(day, place.name);
            }
        });
    }, [day, onCityChange]);

    // ✅ Add POI to list
    const handleAddPOI = (poi: POI) => {
        const updated = [...pois, poi];
        setPois(updated);
        onUpdatePois(day, updated);
    };

    // ✅ Remove POI
    const handleRemovePOI = (index: number) => {
        const updated = pois.filter((_, i) => i !== index);
        setPois(updated);
        onUpdatePois(day, updated);
    };

    return (
        <div
            className={`p-4 border rounded-lg ${
                isActive ? "bg-blue-50 border-blue-400" : "bg-white border-gray-300"
            }`}
        >
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => onSelectDay(day)}
            >
                <h2 className="text-xl font-bold">
                    Day {day}{" "}
                    <span className="text-gray-600 text-base">({date || "No date"})</span>
                </h2>
            </div>

            {/* ✅ City input with Google Autocomplete */}
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                    ref={cityInputRef}
                    type="text"
                    defaultValue={city}
                    placeholder="Type a city..."
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            {/* ✅ Search POI input */}
            <div className="mt-4">
                <SearchPOI
                    city={city}
                    onPick={handleAddPOI}
                    placeholder="Search places to visit..."
                />
            </div>

            {/* ✅ List of added POIs */}
            <div className="mt-4 space-y-2">
                {pois.length > 0 ? (
                    pois.map((poi, i) => (
                        <div
                            key={i}
                            className="border p-3 rounded flex justify-between items-center bg-white shadow-sm"
                        >
                            <div>
                                <p className="font-medium text-black">{poi.name}</p>
                                <p className="text-sm text-gray-600">{poi.address}</p>
                            </div>
                            <button
                                onClick={() => handleRemovePOI(i)}
                                className="text-red-500 hover:text-red-700 font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No POIs added for this day yet.</p>
                )}
            </div>
        </div>
    );
}

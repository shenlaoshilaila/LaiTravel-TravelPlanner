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
    onRemovePOIGlobally?: (poi: POI) => void; // ✅ global callback
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
                                          onRemovePOIGlobally,
                                      }: DayPOISectionProps) {
    const [pois, setPois] = useState<POI[]>(initialPois || []);
    const cityInputRef = useRef<HTMLInputElement | null>(null);

    // keep synced with parent
    useEffect(() => {
        setPois(initialPois);
    }, [initialPois]);

    // google autocomplete
    useEffect(() => {
        if (!(window as any).google || !cityInputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(cityInputRef.current, {
            types: ["(cities)"],
            fields: ["formatted_address", "geometry", "name"],
        });
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) onCityChange(day, place.formatted_address);
            else if (place?.name) onCityChange(day, place.name);
        });
    }, [day, onCityChange]);

    // add POI
    const handleAddPOI = (poi: POI) => {
        const updated = [...pois, poi];
        setPois(updated);
        onUpdatePois(day, updated);
    };

    // ✅ remove POI from current + all other days
    const handleRemovePOI = (index: number) => {
        const poiToRemove = pois[index];
        const updated = pois.filter((_, i) => i !== index);
        setPois(updated);
        onUpdatePois(day, updated);
        onRemovePOIGlobally?.(poiToRemove); // 🔁 trigger global removal
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

            {/* city input */}
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                    ref={cityInputRef}
                    type="text"
                    value={city}
                    onChange={(e) => onCityChange(day, e.target.value)}
                    placeholder="Type a city..."
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            {/* search */}
            <div className="mt-4">
                <SearchPOI
                    city={city}
                    onPick={handleAddPOI}
                    placeholder="Search places to visit..."
                />
            </div>

            {/* POI list */}
            <div className="mt-4 space-y-2">
                {pois.length > 0 ? (
                    pois.map((poi, i) => (
                        <div
                            key={i}
                            className="border p-3 rounded flex justify-between items-center bg-white shadow-sm"
                        >
                            <div>
                                <p className="font-bold text-black">{poi.name}</p>
                                <p className="text-sm text-gray-700">{poi.address}</p>
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
                    <p className="text-gray-500 italic">
                        No POIs added for this day yet.
                    </p>
                )}
            </div>
        </div>
    );
}

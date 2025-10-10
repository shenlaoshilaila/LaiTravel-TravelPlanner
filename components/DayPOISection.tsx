"use client";
import React, { useState } from "react";
import SearchPOI from "@/components/SearchPOI";
import { POI } from "./types";

interface DayPOISectionProps {
    day: number;
    date: string;
    city: string;
    initialPois: POI[];
    onUpdatePois: (day: number, pois: POI[]) => void;
    onSelectDay: (day: number) => void;
    onCityChange: (day: number, city: string) => void;
    isActive: boolean;
    backendUrl: string;
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
    const [pois, setPois] = useState<POI[]>(initialPois);

    // ✅ Handle adding POIs
    const handleAddPOI = (poi: POI) => {
        const updated = [...pois, { ...poi, sequence: pois.length + 1 }];
        setPois(updated);
        onUpdatePois(day, updated);
    };

    // ✅ Handle deleting POIs
    const handleDeletePOI = (index: number) => {
        const updated = pois.filter((_, i) => i !== index);
        setPois(updated);
        onUpdatePois(day, updated);
    };

    return (
        <section
            className={`p-4 border rounded-lg shadow-sm cursor-pointer transition ${
                isActive ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
            }`}
            onClick={() => onSelectDay(day)}
        >
            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">
                        Day {day} <span className="text-gray-500">({date})</span>
                    </h2>
                </div>
            </div>

            {/* 🔹 City Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => onCityChange(day, e.target.value)}
                    placeholder="Enter city name"
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            {/* 🔹 POI Search */}
            {city && (
                <div className="mb-4">
                    <SearchPOI
                        city={city}
                        onPick={(poi) => handleAddPOI(poi)}
                        placeholder="Search places to visit..."
                    />
                </div>
            )}

            {/* 🔹 POI List (copyable) */}
            <div className="space-y-3">
                {pois.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                        No POIs added for this day yet.
                    </p>
                ) : (
                    pois.map((poi, i) => (
                        <div
                            key={i}
                            className="border p-4 rounded-lg shadow-sm flex justify-between items-start select-text"
                        >
                            <div>
                                <h3 className="font-bold text-lg">
                                    {i + 1}. {poi.name}
                                </h3>
                                <p className="text-green-700 text-sm">{poi.address}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent selecting day
                                    handleDeletePOI(i);
                                }}
                                className="text-red-500 hover:text-red-700 text-lg"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

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
    onRemovePOIGlobally?: (poi: POI) => void;
}

interface DistanceInfo {
    drivingText?: string;
    walkingText?: string;
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
    const [distances, setDistances] = useState<Record<number, DistanceInfo>>({});
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const cityInputRef = useRef<HTMLInputElement | null>(null);

    // ✅ Google Places Autocomplete
    useEffect(() => {
        if (!(window as any).google || !cityInputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(cityInputRef.current, {
            types: ["(cities)"],
            fields: ["formatted_address", "geometry", "name"],
        });
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) {
                onCityChange(day, place.formatted_address);
            } else if (place?.name) {
                onCityChange(day, place.name);
            }
        });
    }, [day, onCityChange]);

    // ✅ Sync input with prop
    useEffect(() => {
        if (cityInputRef.current && city) {
            cityInputRef.current.value = city;
        }
    }, [city]);

    // ✅ Add POI
    const handleAddPOI = (poi: POI) => {
        const updated = [...pois, poi];
        setPois(updated);
        onUpdatePois(day, updated);
    };

    // ✅ Remove POI (local + global)
    const handleRemovePOI = (index: number) => {
        const poiToRemove = pois[index];
        const updated = pois.filter((_, i) => i !== index);
        setPois(updated);
        onUpdatePois(day, updated);

        // 🔁 also remove globally if callback provided
        if (onRemovePOIGlobally) {
            onRemovePOIGlobally(poiToRemove);
        }
    };

    // ✅ Drag & Drop reorder
    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDrop = (index: number) => {
        if (dragIndex === null) return;
        const updated = [...pois];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(index, 0, moved);
        setPois(updated);
        onUpdatePois(day, updated);
        setDragIndex(null);
    };

    // ✅ Distance calculation
    useEffect(() => {
        if (!(window as any).google || pois.length < 2) return;

        const service = new google.maps.DistanceMatrixService();
        pois.forEach((p, i) => {
            if (i >= pois.length - 1) return;
            const origin = { lat: p.lat, lng: p.lng };
            const destination = { lat: pois[i + 1].lat, lng: pois[i + 1].lng };

            const handleResult = (
                res: google.maps.DistanceMatrixResponse | null,
                status: google.maps.DistanceMatrixStatus,
                mode: "driving" | "walking"
            ) => {
                if (status === "OK" && res?.rows?.[0]?.elements?.[0]?.status === "OK") {
                    const el = res.rows[0].elements[0];
                    const text = `${el.distance.text} (${el.duration.text})`;
                    setDistances((prev) => ({
                        ...prev,
                        [i]: {
                            ...prev[i],
                            ...(mode === "driving"
                                ? { drivingText: text }
                                : { walkingText: text }),
                        },
                    }));
                }
            };

            const modes: { type: google.maps.TravelMode; label: "driving" | "walking" }[] =
                [
                    { type: google.maps.TravelMode.DRIVING, label: "driving" },
                    { type: google.maps.TravelMode.WALKING, label: "walking" },
                ];

            modes.forEach(({ type, label }) => {
                service.getDistanceMatrix(
                    {
                        origins: [origin],
                        destinations: [destination],
                        travelMode: type,
                    },
                    (res, status) => handleResult(res, status, label)
                );
            });
        });
    }, [pois]);

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

            {/* ✅ City Input */}
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                    ref={cityInputRef}
                    type="text"
                    value={city}
                    onChange={(e) => onCityChange(day, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Type a city..."
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            {/* ✅ POI Search */}
            <div className="mt-4">
                <SearchPOI
                    city={city}
                    onPick={handleAddPOI}
                    placeholder="Search places to visit..."
                />
            </div>

            {/* ✅ POI List */}
            <div className="mt-4 space-y-2">
                {pois.length > 0 ? (
                    pois.map((poi, i) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(i)}
                            className={`border p-3 rounded flex justify-between items-center bg-white shadow-sm transition ${
                                dragIndex === i ? "opacity-50" : "opacity-100"
                            }`}
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

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

// Add Google Maps type declarations
declare global {
    interface Window {
        google: typeof google;
    }
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

    // ✅ Debug: Check what data we're receiving
    useEffect(() => {
        console.log(`Day ${day} - Received initialPois:`, initialPois);
        console.log(`Day ${day} - Current local pois:`, pois);
    }, [initialPois, day]);

    // ✅ Fix the sync issue - use a more reliable approach
    useEffect(() => {
        console.log(`Day ${day} - Sync: initialPois`, initialPois);

        if (initialPois && Array.isArray(initialPois)) {
            // Deep comparison to avoid unnecessary updates
            const currentPoisString = JSON.stringify(pois);
            const newPoisString = JSON.stringify(initialPois);

            if (currentPoisString !== newPoisString) {
                console.log(`Day ${day} - Actually updating POIs`);
                setPois([...initialPois]);
            }
        } else if (!initialPois && pois.length > 0) {
            // Clear if initialPois becomes empty
            setPois([]);
        } else if (!initialPois) {
            // Ensure we always have an array
            setPois([]);
        }
    }, [initialPois, day]);

    // ✅ Google Places Autocomplete for city input
    useEffect(() => {
        if (!window.google || !cityInputRef.current) return;
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

    // ✅ Keep city input value synced
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

    // ✅ Remove POI (both locally and globally)
    const handleRemovePOI = (index: number) => {
        const poiToRemove = pois[index];
        const updated = pois.filter((_, i) => i !== index);
        setPois(updated);
        onUpdatePois(day, updated);

        if (onRemovePOIGlobally) {
            onRemovePOIGlobally(poiToRemove);
        }
    };

    // ✅ Handle drag and drop reorder
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

    // ✅ Compute distances between consecutive POIs
    useEffect(() => {
        if (!window.google || pois.length < 2) return;

        const service = new google.maps.DistanceMatrixService();
        const newDistances: Record<number, DistanceInfo> = {};

        const calculateDistances = async () => {
            for (let i = 0; i < pois.length - 1; i++) {
                const origin = { lat: pois[i].lat || 0, lng: pois[i].lng || 0 };
                const destination = { lat: pois[i + 1].lat || 0, lng: pois[i + 1].lng || 0 };

                // Skip if coordinates are invalid
                if (origin.lat === 0 && origin.lng === 0) continue;
                if (destination.lat === 0 && destination.lng === 0) continue;

                try {
                    const [drivingResult, walkingResult] = await Promise.all([
                        new Promise<google.maps.DistanceMatrixResponse | null>((resolve) => {
                            service.getDistanceMatrix(
                                {
                                    origins: [origin],
                                    destinations: [destination],
                                    travelMode: google.maps.TravelMode.DRIVING,
                                },
                                resolve
                            );
                        }),
                        new Promise<google.maps.DistanceMatrixResponse | null>((resolve) => {
                            service.getDistanceMatrix(
                                {
                                    origins: [origin],
                                    destinations: [destination],
                                    travelMode: google.maps.TravelMode.WALKING,
                                },
                                resolve
                            );
                        }),
                    ]);

                    const drivingElement = drivingResult?.rows[0]?.elements[0];
                    const walkingElement = walkingResult?.rows[0]?.elements[0];

                    newDistances[i] = {
                        drivingText: drivingElement?.status === "OK"
                            ? `${drivingElement.distance.text} (${drivingElement.duration.text})`
                            : "N/A",
                        walkingText: walkingElement?.status === "OK"
                            ? `${walkingElement.distance.text} (${walkingElement.duration.text})`
                            : "N/A",
                    };
                } catch (error) {
                    console.error(`Failed to calculate distance between POIs ${i} and ${i + 1}:`, error);
                    newDistances[i] = { drivingText: "Error", walkingText: "Error" };
                }
            }

            setDistances(newDistances);
        };

        calculateDistances();
    }, [pois]);

    // Handle empty states
    const displayPois = Array.isArray(pois) ? pois : [];

    return (
        <div
            className={`p-4 border rounded-lg transition-all duration-300 ${
                isActive ? "bg-blue-50 border-blue-400" : "bg-white border-gray-300"
            }`}
        >
            {/* Header */}
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => onSelectDay(day)}
            >
                <h2 className="text-xl font-bold">
                    Day {day}{" "}
                    <span className="text-gray-600 text-base">
                        ({date || "No date"})
                    </span>
                </h2>
            </div>

            {/* City Input */}
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

            {/* POI Search */}
            <div className="mt-4">
                <SearchPOI
                    city={city}
                    onPick={handleAddPOI}
                    placeholder="Search places to visit..."
                />
            </div>

            {/* POI List */}
            <div className="mt-4 space-y-2">
                {displayPois.length > 0 ? (
                    displayPois.map((poi, i) => (
                        <div
                            key={`${poi.name}-${i}`}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-blue-100');
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.classList.remove('bg-blue-100');
                            }}
                            onDrop={() => handleDrop(i)}
                            className={`border p-3 rounded flex justify-between items-center bg-white shadow-sm transition-all cursor-move ${
                                dragIndex === i ? 'opacity-50 border-blue-400' : 'opacity-100 border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-400">⠿</span>
                                <div>
                                    <p className="font-bold text-black">{poi.name}</p>
                                    {poi.address && (
                                        <p className="text-sm text-gray-700">{poi.address}</p>
                                    )}
                                    {distances[i] && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            🚗 {distances[i].drivingText} · 🚶{" "}
                                            {distances[i].walkingText}
                                        </p>
                                    )}
                                </div>
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
"use client";
import React, { useEffect, useState, useRef } from "react";
import { POI } from "@/components/types";
import SearchPOI from "@/components/SearchPOI";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";

interface DayPOISectionProps {
    day: number;
    date?: string;
    city?: string;
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

/** --- City Autocomplete Input --- */
function CitySearch({
                        value,
                        onChange,
                    }: {
    value?: string;
    onChange: (city: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (inputRef.current && (window as any).google) {
            autocompleteRef.current = new google.maps.places.Autocomplete(
                inputRef.current,
                { types: ["(cities)"] }
            );
            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current?.getPlace();
                if (place?.formatted_address) {
                    onChange(place.formatted_address);
                } else if (place?.name) {
                    onChange(place.name);
                }
            });
        }
    }, []);

    return (
        <input
            ref={inputRef}
            type="text"
            className="border px-2 py-1 rounded w-full"
            placeholder="Search city..."
            defaultValue={value}
        />
    );
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

    // Debug: Log POI data to see what addresses are available
    useEffect(() => {
        console.log(`🔍 DayPOISection ${day} - POIs:`, initialPois.map(poi => ({
            name: poi.name,
            address: poi.address,
            hasAddress: !!poi.address,
            place_id: poi.place_id
        })));
    }, [initialPois, day]);

    // --- Calculate distance matrix ---
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

    // --- Drag & Drop reorder ---
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const reordered = Array.from(initialPois);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        onUpdatePois(day, reordered.map((p, i) => ({ ...p, sequence: i + 1 })));
    };

    // --- Delete POI ---
    const handleDeletePOI = (index: number) => {
        const updated = initialPois.filter((_, i) => i !== index);
        onUpdatePois(day, updated.map((p, i) => ({ ...p, sequence: i + 1 })));
    };

    return (
        <div
            className={`p-4 border rounded mb-4 ${
                isActive ? "bg-blue-50 border-blue-400" : "bg-white"
            }`}
            onClick={() => onSelectDay(day)}
        >
            <h3 className="font-semibold">
                {date ? new Date(date).toDateString() : "No date"} — Day {day}{" "}
                {isActive && <span className="text-green-600">Active</span>}
            </h3>

            {/* City Input with Autocomplete */}
            <div className="mt-2">
                <label className="block text-sm font-medium">Select City:</label>
                <CitySearch value={city} onChange={(c) => onCityChange(day, c)} />
            </div>

            {/* POI Search */}
            {city && (
                <div className="mt-2">
                    <SearchPOI
                        city={city}
                        onPick={(poi: POI) => {
                            // ✅ Include ALL POI data including address
                            const newPOI: POI = {
                                name: poi.name,
                                lat: poi.lat,
                                lng: poi.lng,
                                place_id: poi.place_id,
                                address: poi.address, // 🎯 Make sure address is included
                                rating: poi.rating,
                                photoUrl: poi.photoUrl,
                                url: poi.url,
                                sequence: initialPois.length + 1,
                                day,
                                city,
                            };
                            console.log("🎯 Adding new POI with address:", newPOI.address);
                            onUpdatePois(day, [...initialPois, newPOI]);
                        }}
                        placeholder="Search POI..."
                    />
                </div>
            )}

            {/* POI List with Drag & Drop + Delete */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`day-${day}`}>
                    {(provided) => (
                        <ul
                            className="space-y-2 mt-2"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {initialPois.map((poi: POI, i: number) => (
                                <Draggable
                                    key={`${poi.place_id || poi.name}-${i}`}
                                    draggableId={`poi-${day}-${i}`}
                                    index={i}
                                >
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="flex justify-between items-start p-3 border rounded bg-white shadow-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {i + 1}. {poi.name}
                                                </div>
                                                {/* 🎯 ADDED ADDRESS DISPLAY */}
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {poi.address ? (
                                                        <span className="text-green-700">{poi.address}</span>
                                                    ) : (
                                                        <span className="text-red-500">No address available</span>
                                                    )}
                                                </div>
                                                {/* Debug info - only show in development */}
                                                {process.env.NODE_ENV === 'development' && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        ID: {poi.place_id} | Lat: {poi.lat?.toFixed(4)} | Lng: {poi.lng?.toFixed(4)}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePOI(i);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm ml-2"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>

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
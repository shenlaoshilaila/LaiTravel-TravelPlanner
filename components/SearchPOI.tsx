"use client";
import React, { useState, useEffect, useRef } from "react";
import { POI } from "./types";

interface SearchPOIProps {
    city: string;
    onPick: (poi: POI) => void;
    placeholder?: string;
}

export default function SearchPOI({ city, onPick, placeholder }: SearchPOIProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<google.maps.places.PlaceResult[]>([]);
    const [loading, setLoading] = useState(false);

    const mapRef = useRef<HTMLDivElement | null>(null);
    const serviceRef = useRef<google.maps.places.PlacesService | null>(null);

    // initialize PlacesService once
    useEffect(() => {
        if (mapRef.current && !serviceRef.current) {
            const dummyMap = new google.maps.Map(mapRef.current);
            serviceRef.current = new google.maps.places.PlacesService(dummyMap);
        }
    }, []);

    const handleSearch = () => {
        if (!query || !serviceRef.current) return;

        setLoading(true);
        setResults([]);

        serviceRef.current.textSearch(
            {
                query: city ? `${query} in ${city}` : query,
            },
            (places, status) => {
                setLoading(false);
                if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    places &&
                    places.length > 0
                ) {
                    setResults(places);
                } else {
                    setResults([]);
                }
            }
        );
    };

    return (
        <div>
            {/* Hidden div required by PlacesService */}
            <div ref={mapRef} style={{ display: "none" }} />

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={placeholder ?? "Search places..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                    Search
                </button>
            </div>

            {loading && <p className="text-sm text-gray-500 mt-2">Searching…</p>}

            <ul className="mt-2 space-y-2">
                {results.map((p, i) => (
                    <li
                        key={i}
                        className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                        onClick={() =>
                            p.geometry?.location &&
                            onPick({
                                name: p.name ?? "Unknown",
                                lat: p.geometry.location.lat(),
                                lng: p.geometry.location.lng(),
                                sequence: 0,
                                day: 0,
                            })
                        }
                    >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">
                            {p.formatted_address ?? ""}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

"use client";
import React, { useState, useRef, useEffect } from "react";
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
    const [error, setError] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement | null>(null);
    const serviceRef = useRef<google.maps.places.PlacesService | null>(null);

    // Initialize PlacesService
    useEffect(() => {
        if (mapRef.current && !serviceRef.current && (window as any).google) {
            const dummyMap = new google.maps.Map(mapRef.current);
            serviceRef.current = new google.maps.places.PlacesService(dummyMap);
        }
    }, []);

    const handleSearch = () => {
        if (!query) return;
        if (!serviceRef.current) {
            setError("Google Maps API not loaded yet.");
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        const text = city ? `${query}, ${city}` : query;

        serviceRef.current.textSearch({ query: text }, (places, status) => {
            setLoading(false);

            if (status === google.maps.places.PlacesServiceStatus.OK && places && places.length > 0) {
                setResults(places);
            } else {
                console.warn("Places search failed:", status);
                setError("No results found.");
            }
        });
    };

    return (
        <div>
            {/* hidden map container for PlacesService */}
            <div ref={mapRef} style={{ display: "none" }} />

            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    placeholder={placeholder ?? "Search places..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!query || loading}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Searching…" : "Search"}
                </button>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <ul className="mt-2 space-y-2">
                {results.map((p, i) => (
                    <li
                        key={i}
                        className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                        onClick={() => {
                            if (p.geometry?.location) {
                                const lat = p.geometry.location.lat();
                                const lng = p.geometry.location.lng();

                                onPick({
                                    name: p.name ?? "Unknown",
                                    lat: typeof lat === "number" ? lat : Number(lat),
                                    lng: typeof lng === "number" ? lng : Number(lng),
                                    sequence: 0,
                                    day: 0,
                                    placeId: p.place_id ?? "", // ✅ now included
                                    city: p.formatted_address ?? ""
                                });
                            }
                            // ✅ clear dropdown + input
                            setQuery("");
                            setResults([]);
                        }}
                    >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.formatted_address ?? ""}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

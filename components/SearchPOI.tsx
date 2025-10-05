"use client";
import React, { useState } from "react";
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

    const handleSearch = () => {
        if (!query || !(window as any).google) return;
        setLoading(true);

        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            query: `${query} in ${city}`,
            fields: ["name", "geometry", "place_id"],
        };

        service.textSearch(request, (res, status) => {
            setLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && res) {
                setResults(res);
            } else {
                setResults([]);
            }
        });
    };

    const handlePick = (place: google.maps.places.PlaceResult) => {
        if (!place.geometry?.location) return;

        const poi: POI = {
            name: place.name || "Unnamed Place",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            place_id: place.place_id || undefined, // ✅ now stored
        };

        onPick(poi);
        setQuery("");
        setResults([]);
    };

    return (
        <div>
            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder || "Search POI..."}
                    className="border px-2 py-1 flex-1 rounded"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-500 text-white px-3 rounded"
                >
                    {loading ? "..." : "Search"}
                </button>
            </div>

            {/* Search Results */}
            <div className="mt-2 space-y-1">
                {results.map((r, i) => (
                    <div
                        key={i}
                        className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => handlePick(r)}
                    >
                        <p className="font-medium">{r.name}</p>
                        <p className="text-sm text-gray-500">
                            {r.formatted_address || "No address available"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

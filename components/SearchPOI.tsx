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

    // 🔍 Handle Google Places search
    const handleSearch = () => {
        if (!query || !(window as any).google) return;
        setLoading(true);

        const service = new google.maps.places.PlacesService(
            document.createElement("div")
        );

        const request = {
            query: `${query} in ${city}`,
            fields: [
                "name",
                "geometry",
                "formatted_address",
                "photos",
                "place_id",
                "rating",
                "user_ratings_total",
            ],
        };

        service.textSearch(request, (res, status) => {
            setLoading(false);
            if (status === "OK" && res) {
                setResults(res);
            } else {
                setResults([]);
            }
        });
    };

    // 📍 When user picks a POI from the list
    const handlePick = (place: google.maps.places.PlaceResult) => {
        if (!place.geometry?.location) return;

        const poi: POI = {
            name: place.name || "Unnamed Place",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id,
            city,
        };

        onPick(poi);
        setQuery("");
        setResults([]);
    };

    return (
        <div>
            {/* Search input */}
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                    {loading ? "..." : "Search"}
                </button>
            </div>

            {/* Search results */}
            <div className="mt-2 space-y-2">
                {results.map((r, i) => {
                    const photoUrl = r.photos?.[0]?.getUrl({ maxWidth: 100, maxHeight: 100 });
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 border p-2 rounded cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handlePick(r)}
                        >
                            {/* Thumbnail */}
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={r.name || "POI"}
                                    className="w-16 h-16 rounded object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                    📍
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex flex-col">
                                <span className="font-medium">{r.name}</span>
                                <span className="text-sm text-gray-600">
                  {r.formatted_address || "No address available"}
                </span>
                                {r.rating && (
                                    <span className="text-xs text-yellow-600">
                    ⭐ {r.rating} ({r.user_ratings_total || 0})
                  </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

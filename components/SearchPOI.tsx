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
            fields: ["name", "geometry", "place_id"], // keep lightweight for search
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
        const service = new google.maps.places.PlacesService(document.createElement("div"));

        service.getDetails(
            {
                placeId: place.place_id!,
                fields: [
                    "name",
                    "formatted_address",
                    "geometry",
                    "rating",
                    "photos",
                    "url",
                    "place_id",
                ],
            },
            (detailed, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && detailed) {
                    const poi: POI = {
                        name: detailed.name || "Unnamed Place",
                        lat: detailed.geometry?.location?.lat() ?? 0,
                        lng: detailed.geometry?.location?.lng() ?? 0,
                        place_id: detailed.place_id,
                        address: detailed.formatted_address || "Address unavailable",
                        rating: detailed.rating,
                        photoUrl: detailed.photos?.[0]?.getUrl({ maxWidth: 400 }),
                        url: detailed.url,
                    };

                    onPick(poi);
                    setQuery("");
                    setResults([]);
                } else {
                    console.warn("getDetails failed:", status);
                }
            }
        );
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
                    className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600 transition"
                >
                    {loading ? "Loading..." : "Search"}
                </button>
            </div>

            {/* Results */}
            <div className="mt-2 space-y-1">
                {results.map((r, i) => (
                    <div
                        key={i}
                        className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => handlePick(r)}
                    >
                        {r.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

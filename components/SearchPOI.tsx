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

    // 🔍 Handle text search
    const handleSearch = () => {
        if (!query || !(window as any).google) return;
        setLoading(true);

        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            query: `${query} in ${city}`,
            fields: ["name", "geometry", "place_id", "formatted_address", "vicinity"],
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

    // 📍 Handle POI click → fetch full details (with reverse geocode fallback)
    const handlePick = (place: google.maps.places.PlaceResult) => {
        const service = new google.maps.places.PlacesService(document.createElement("div"));

        service.getDetails(
            {
                placeId: place.place_id!,
                fields: [
                    "name",
                    "formatted_address",
                    "address_components",
                    "vicinity",
                    "geometry",
                    "rating",
                    "photos",
                    "url",
                    "place_id",
                ],
            },
            (detailed, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && detailed) {
                    const location = detailed.geometry?.location;
                    let address = detailed.formatted_address || detailed.vicinity;

                    // 🧭 If address missing, fall back to reverse geocoding
                    if (!address && location) {
                        const geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ location }, (geoResults, geoStatus) => {
                            address = geoStatus === "OK" && geoResults?.length
                                ? geoResults[0].formatted_address
                                : "Address unavailable";
                            buildPOI(detailed, address);
                        });
                    } else {
                        buildPOI(detailed, address || "Address unavailable");
                    }
                } else {
                    // If getDetails fails completely, use original place data
                    buildPOI(place, place.formatted_address || place.vicinity || "Address unavailable");
                }
            }
        );

        // 🧩 Helper to finalize POI object
        function buildPOI(detailed: google.maps.places.PlaceResult, address: string) {
            const poi: POI = {
                name: detailed.name || "Unnamed Place",
                lat: detailed.geometry?.location?.lat() ?? 0,
                lng: detailed.geometry?.location?.lng() ?? 0,
                place_id: detailed.place_id,
                address: address || "Address unavailable",
                rating: detailed.rating,
                photoUrl: detailed.photos?.[0]?.getUrl({ maxWidth: 400 }),
                url: detailed.url,
            };

            onPick(poi);
            setQuery("");
            setResults([]);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div>
            {/* 🔍 Search input */}
            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder || "Search POI..."}
                    className="border px-2 py-1 flex-1 rounded"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
                >
                    {loading ? "Loading..." : "Search"}
                </button>
            </div>

            {/* 🧭 Results list */}
            <div className="mt-2 space-y-1">
                {results.map((r, i) => (
                    <div
                        key={i}
                        className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => handlePick(r)}
                    >
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-gray-600">
                            {r.formatted_address || r.vicinity || "Address unavailable"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
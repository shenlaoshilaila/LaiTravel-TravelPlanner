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

                    // 🧭 If address missing, fall back to reverse geocoding
                    if (!detailed.formatted_address && location) {
                        const geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ location }, (geoResults, geoStatus) => {
                            const fallbackAddress =
                                geoStatus === "OK" && geoResults?.length
                                    ? geoResults[0].formatted_address
                                    : "Address unavailable";

                            buildPOI(detailed, fallbackAddress);
                        });
                    } else {
                        const addr =
                            detailed.formatted_address ||
                            detailed.vicinity ||
                            (detailed.address_components
                                ? detailed.address_components.map((c) => c.long_name).join(", ")
                                : "Address unavailable");
                        buildPOI(detailed, addr);
                    }
                } else {
                    console.warn("getDetails failed:", status);
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
                address,
                rating: detailed.rating,
                photoUrl: detailed.photos?.[0]?.getUrl({ maxWidth: 400 }),
                url: detailed.url,
            };

            onPick(poi);
            setQuery("");
            setResults([]);
        }
    };

    return (
        <div>
            {/* 🔍 Search input */}
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

            {/* 🧭 Results list */}
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

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
    const [error, setError] = useState<string>("");

    // 🔍 Handle text search
    const handleSearch = () => {
        if (!query) {
            setError("Please enter a search query");
            return;
        }

        if (!(window as any).google) {
            setError("Google Maps API not loaded");
            return;
        }

        setLoading(true);
        setError("");
        setResults([]);

        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            query: `${query} in ${city}`,
            fields: ["name", "geometry", "place_id", "formatted_address", "vicinity"],
        };

        console.log("🔍 Search request:", request.query);

        service.textSearch(request, (res, status) => {
            setLoading(false);
            console.log("🔍 Search response - Status:", status, "Results:", res);

            if (status === google.maps.places.PlacesServiceStatus.OK && res) {
                // Log address availability in search results
                res.forEach((result, index) => {
                    console.log(`📍 Result ${index}:`, {
                        name: result.name,
                        formatted_address: result.formatted_address,
                        vicinity: result.vicinity,
                        place_id: result.place_id
                    });
                });
                setResults(res);
            } else {
                setError(`Search failed: ${status}`);
                setResults([]);
            }
        });
    };

    // 📍 Handle POI click → fetch full details
    const handlePick = (place: google.maps.places.PlaceResult) => {
        console.log("🎯 Picked place basic info:", {
            name: place.name,
            formatted_address: place.formatted_address,
            vicinity: place.vicinity,
            place_id: place.place_id
        });

        setLoading(true);
        setError("");

        const service = new google.maps.places.PlacesService(document.createElement("div"));

        service.getDetails(
            {
                placeId: place.place_id!,
                fields: [
                    "name",
                    "formatted_address",
                    "vicinity",
                    "geometry",
                    "place_id",
                    "rating",
                    "photos",
                    "url"
                ],
            },
            (detailed, status) => {
                setLoading(false);
                console.log("📋 GetDetails response - Status:", status, "Full details:", detailed);

                if (status === google.maps.places.PlacesServiceStatus.OK && detailed) {
                    console.log("✅ GetDetails SUCCESS - Address data:", {
                        formatted_address: detailed.formatted_address,
                        vicinity: detailed.vicinity,
                        has_geometry: !!detailed.geometry?.location
                    });

                    const location = detailed.geometry?.location;
                    let finalAddress = detailed.formatted_address || detailed.vicinity;

                    if (finalAddress) {
                        console.log("✅ Using address from getDetails:", finalAddress);
                        buildPOI(detailed, finalAddress);
                    } else if (location) {
                        console.log("🔄 No address in getDetails, attempting reverse geocoding...");
                        reverseGeocode(location, (address) => {
                            buildPOI(detailed, address);
                        });
                    } else {
                        console.log("❌ No address and no coordinates available");
                        buildPOI(detailed, "Address unavailable");
                    }
                } else {
                    console.warn("❌ getDetails FAILED:", status);
                    console.log("🔄 Falling back to original place data:", {
                        formatted_address: place.formatted_address,
                        vicinity: place.vicinity
                    });

                    const fallbackAddress = place.formatted_address || place.vicinity || "Address unavailable";
                    buildPOI(place, fallbackAddress);
                }
            }
        );
    };

    // 🗺️ Reverse geocode as fallback
    const reverseGeocode = (location: google.maps.LatLng, callback: (address: string) => void) => {
        const geocoder = new google.maps.Geocoder();
        console.log("🗺️ Reverse geocoding coordinates:", location.lat(), location.lng());

        geocoder.geocode({ location }, (results, status) => {
            console.log("🗺️ Reverse geocode response - Status:", status, "Results:", results);

            if (status === "OK" && results && results.length > 0) {
                const address = results[0].formatted_address;
                console.log("✅ Reverse geocode SUCCESS:", address);
                callback(address);
            } else {
                console.log("❌ Reverse geocode FAILED");
                callback("Address unavailable");
            }
        });
    };

    // 🧩 Helper to finalize POI object
    const buildPOI = (place: google.maps.places.PlaceResult, address: string) => {
        const location = place.geometry?.location;

        const poi: POI = {
            name: place.name || "Unnamed Place",
            lat: location?.lat() ?? 0,
            lng: location?.lng() ?? 0,
            place_id: place.place_id,
            address: address,
            rating: place.rating,
            photoUrl: place.photos?.[0]?.getUrl?.({ maxWidth: 400 }),
            url: place.url,
        };

        console.log("🎉 FINAL POI OBJECT TO PARENT:", poi);
        console.log("📤 Calling onPick callback with POI...");

        onPick(poi);
        setQuery("");
        setResults([]);
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="search-poi">
            {/* 🔍 Search input */}
            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder || "Search POI..."}
                    className="border px-3 py-2 flex-1 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Loading..." : "Search"}
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* 🧭 Results list */}
            <div className="mt-3 space-y-2">
                {results.map((result, index) => (
                    <div
                        key={`${result.place_id}-${index}`}
                        className="border border-gray-200 p-3 rounded cursor-pointer hover:bg-gray-50 transition shadow-sm"
                        onClick={() => handlePick(result)}
                    >
                        <div className="font-medium text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                            {result.formatted_address || result.vicinity || "No address in search results"}
                        </div>
                        {result.place_id && (
                            <div className="text-xs text-gray-400 mt-1">ID: {result.place_id}</div>
                        )}
                    </div>
                ))}

                {results.length === 0 && !loading && query && (
                    <div className="text-gray-500 text-center py-4">
                        No results found for "{query}"
                    </div>
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="mt-2 text-blue-500 text-sm">
                    Searching...
                </div>
            )}
        </div>
    );
}
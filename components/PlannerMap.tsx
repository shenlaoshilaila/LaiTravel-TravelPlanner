"use client";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { POI } from "@/components/types";

interface PlannerMapProps {
    pois: POI[];
    city?: string;
}

export default function PlannerMap({ pois, city }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const lastCityRef = useRef<string>("");

    // ✅ Initialize map once
    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;

        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // default Beijing
                zoom: 5,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        }
    }, []);

    // ✅ Center map when city changes
    useEffect(() => {
        if (!mapInstance.current || !city) return;

        // Avoid redundant geocoding
        if (city === lastCityRef.current) return;
        lastCityRef.current = city;

        const map = mapInstance.current;
        const geocoder = new google.maps.Geocoder();
        let cancelled = false;

        const geocodeCity = (attempt = 1) => {
            geocoder.geocode({ address: city }, (results, status) => {
                if (cancelled) return;

                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                    const loc = results[0].geometry.location;
                    console.log("🗺️ Geocoded city:", city, loc.lat(), loc.lng());

                    // ✅ Force center immediately (fixes first-load blank issue)
                    map.setCenter(loc);
                    map.setZoom(12);

                    // ✅ Fit POIs if available
                    if (pois && pois.length > 0) {
                        const bounds = new google.maps.LatLngBounds();
                        pois.forEach((p) => {
                            if (p.lat && p.lng) bounds.extend({ lat: p.lat, lng: p.lng });
                        });
                        if (!bounds.isEmpty()) map.fitBounds(bounds);
                    }
                } else if (attempt === 1) {
                    // retry once
                    setTimeout(() => geocodeCity(2), 600);
                } else {
                    console.warn("❌ Failed to geocode city:", city, status);
                }
            });
        };

        geocodeCity();

        return () => {
            cancelled = true;
        };
    }, [city, pois]);

    // ✅ Update markers and route when POIs change
    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear old markers/routes
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }

        if (!pois || pois.length === 0) return;

        const map = mapInstance.current;
        const bounds = new google.maps.LatLngBounds();
        const placesService = new google.maps.places.PlacesService(map);

        pois.forEach((poi) => {
            if (!poi.lat || !poi.lng) return;

            const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map,
                title: poi.name,
            });

            // 🟦 Marker click → show detail panel
            marker.addListener("click", () => {
                if (poi.place_id) {
                    placesService.getDetails(
                        {
                            placeId: poi.place_id,
                            fields: [
                                "name",
                                "rating",
                                "formatted_address",
                                "photos",
                                "url",
                                "reviews",
                                "opening_hours",
                            ],
                        },
                        (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                                setSelectedPlace(place);
                            } else {
                                setSelectedPlace({
                                    name: poi.name,
                                    formatted_address: "No address available",
                                });
                            }
                        }
                    );
                } else {
                    setSelectedPlace({
                        name: poi.name,
                        formatted_address: "No address available",
                    });
                }
            });

            markersRef.current.push(marker);
            bounds.extend({ lat: poi.lat, lng: poi.lng });
        });

        // ✅ Fit map to POIs
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds);
        }

        // ✅ Draw driving route if multiple POIs
        if (pois.length >= 2) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: { strokeColor: "#0078FF", strokeWeight: 4 },
            });
            directionsRenderer.setMap(map);
            directionsRendererRef.current = directionsRenderer;

            const waypoints = pois.slice(1, -1).map((p) => ({
                location: { lat: p.lat, lng: p.lng },
                stopover: true,
            }));

            directionsService.route(
                {
                    origin: { lat: pois[0].lat, lng: pois[0].lng },
                    destination: {
                        lat: pois[pois.length - 1].lat,
                        lng: pois[pois.length - 1].lng,
                    },
                    waypoints,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK" && result) {
                        directionsRenderer.setDirections(result);
                    } else {
                        console.warn("❌ Directions request failed:", status);
                    }
                }
            );
        }
    }, [pois]);

    return (
        <div className="relative w-full h-full flex">
            {/* 🗺️ Map container */}
            <div ref={mapRef} className="flex-grow h-full rounded" />

            {/* 🟦 Draggable POI Detail Panel */}
            {selectedPlace && (
                <Draggable handle=".drag-handle" defaultPosition={{ x: 100, y: 100 }}>
                    <div className="fixed bg-white shadow-2xl rounded-2xl w-96 overflow-hidden z-50 cursor-move border">
                        {/* Header */}
                        <div className="drag-handle flex justify-between items-center bg-gray-100 px-4 py-3 cursor-grab active:cursor-grabbing">
                            <h2 className="font-bold text-lg text-gray-800">
                                {selectedPlace.name}
                            </h2>
                            <button
                                onClick={() => setSelectedPlace(null)}
                                className="text-gray-500 hover:text-red-600 text-xl font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Photo */}
                        {selectedPlace.photos?.[0] && (
                            <img
                                src={selectedPlace.photos[0].getUrl({ maxWidth: 600 })}
                                alt={selectedPlace.name}
                                className="w-full h-56 object-cover"
                            />
                        )}

                        {/* Info */}
                        <div className="p-4 space-y-2 text-gray-700">
                            <p>
                                📍{" "}
                                {selectedPlace.formatted_address ?? "No address available"}
                            </p>

                            {selectedPlace.rating && (
                                <p>⭐ {selectedPlace.rating.toFixed(1)} / 5</p>
                            )}

                            {selectedPlace.opening_hours && (
                                <p>
                                    🕒{" "}
                                    {selectedPlace.opening_hours.weekday_text?.join(", ")}
                                </p>
                            )}

                            {selectedPlace.url && (
                                <a
                                    href={selectedPlace.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View on Google Maps →
                                </a>
                            )}

                            {selectedPlace.reviews?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Top review:</h4>
                                    <p className="text-gray-600 text-sm italic">
                                        “{selectedPlace.reviews[0].text}”
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        — {selectedPlace.reviews[0].author_name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
    );
}

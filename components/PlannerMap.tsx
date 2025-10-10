"use client";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable"; // 🧩 added
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

    // ✅ Initialize map
    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;

        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // Default: Beijing
                zoom: 12,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        }
    }, []);

    // ✅ Center map when city changes
    useEffect(() => {
        if (!mapInstance.current || !city) return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: city }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                mapInstance.current!.setCenter(results[0].geometry.location);
                if (!pois || pois.length === 0) {
                    mapInstance.current!.setZoom(13);
                }
            }
        });
    }, [city]);

    // ✅ Update pins and routes
    useEffect(() => {
        if (!mapInstance.current) return;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }

        const bounds = new google.maps.LatLngBounds();
        const placesService = new google.maps.places.PlacesService(mapInstance.current!);

        pois.forEach((poi) => {
            if (!poi.lat || !poi.lng) return;

            const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map: mapInstance.current!,
                title: poi.name,
            });

            // 🧭 Click marker → open POI detail
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
                            if (
                                status === google.maps.places.PlacesServiceStatus.OK &&
                                place
                            ) {
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

        if (pois.length > 0) {
            mapInstance.current.fitBounds(bounds);
        }

        // 🛣️ Draw route
        if (pois.length >= 2) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: { strokeColor: "#0078FF", strokeWeight: 4 },
            });
            directionsRenderer.setMap(mapInstance.current!);
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
                    }
                }
            );
        }
    }, [pois]);

    return (
        <div className="relative w-full h-full flex">
            {/* 🗺️ Map */}
            <div ref={mapRef} className="flex-grow h-full rounded" />

            {/* 🟦 Movable info panel */}
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

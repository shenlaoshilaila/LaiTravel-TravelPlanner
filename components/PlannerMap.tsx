"use client";
import React, { useEffect, useRef, useState } from "react";
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
                center: { lat: 39.9042, lng: 116.4074 }, // default Beijing
                zoom: 12,
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

    // ✅ Update pins & draw route
    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear markers and routes
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

            // 🟩 On marker click — show details
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
                                "website",
                                "formatted_phone_number",
                                "opening_hours"
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

        if (pois.length > 0) {
            mapInstance.current.fitBounds(bounds);
        }

        // 🟦 Draw route between POIs
        if (pois.length >= 2) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: "#0078FF",
                    strokeWeight: 4,
                },
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
                    } else {
                        console.warn("Route failed:", status);
                    }
                }
            );
        }
    }, [pois]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full rounded" />

            {/* 🟩 Info Panel */}
            {selectedPlace && (
                <div className="absolute top-4 right-4 bg-white shadow-2xl rounded-xl p-4 w-96 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                            {selectedPlace.name}
                        </h3>
                        <button
                            onClick={() => setSelectedPlace(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    {selectedPlace.photos?.[0] && (
                        <img
                            src={selectedPlace.photos[0].getUrl({ maxWidth: 350 })}
                            alt={selectedPlace.name}
                            className="rounded-lg mb-3"
                        />
                    )}

                    {selectedPlace.rating && (
                        <p className="text-yellow-600 font-semibold mb-1">
                            ⭐ {selectedPlace.rating.toFixed(1)} / 5
                        </p>
                    )}

                    <p className="text-gray-700 text-sm mb-2">
                        📍 {selectedPlace.formatted_address || "Address not available"}
                    </p>

                    {selectedPlace.formatted_phone_number && (
                        <p className="text-sm text-gray-700 mb-1">
                            📞 {selectedPlace.formatted_phone_number}
                        </p>
                    )}

                    {selectedPlace.website && (
                        <a
                            href={selectedPlace.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block mb-1"
                        >
                            🌐 Visit Website
                        </a>
                    )}

                    {selectedPlace.opening_hours?.weekday_text && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <p className="font-semibold mb-1">🕒 Opening Hours</p>
                            {selectedPlace.opening_hours.weekday_text.map((line: string, i: number) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}

                    {selectedPlace.url && (
                        <a
                            href={selectedPlace.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                            View on Google Maps →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

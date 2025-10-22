"use client";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { POI } from "@/components/types";

interface PlannerMapProps {
    pois: POI[];
    city?: string;
    onCityResolved?: (resolvedCity: string) => void;
    dayIndex?: number;
}

export default function PlannerMap({
                                       pois,
                                       city,
                                       onCityResolved,
                                       dayIndex = 0,
                                   }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
        null
    );
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const lastCityRef = useRef<string>("");

    // ✅ Initialize map
    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;
        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // Beijing
                zoom: 5,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        }
    }, []);

    // ✅ Geocode city
    const geocodeCity = (targetCity: string, attempt = 1) => {
        const map = mapInstance.current!;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: targetCity }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const cityResult =
                    results.find((r) => r.types.includes("locality")) || results[0];
                const loc = cityResult.geometry.location;
                map.setCenter(loc);
                map.setZoom(12);

                if (onCityResolved) {
                    const formatted =
                        cityResult.formatted_address ||
                        cityResult.address_components?.[0]?.long_name ||
                        targetCity;
                    onCityResolved(formatted);
                }

                if (pois && pois.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    pois.forEach((p) => {
                        if (p.lat && p.lng) bounds.extend({ lat: p.lat, lng: p.lng });
                    });
                    if (!bounds.isEmpty()) map.fitBounds(bounds);
                }
            } else if (attempt === 1) {
                setTimeout(() => geocodeCity(targetCity, 2), 600);
            } else {
                console.warn("❌ Failed to geocode city:", targetCity, status);
            }
        });
    };

    // ✅ Geocode POIs
    const geocodePOIs = async (poisToGeocode: POI[]) => {
        if (!mapInstance.current || !(window as any).google) return;
        const map = mapInstance.current!;
        const geocoder = new google.maps.Geocoder();
        const updatedPOIs: POI[] = [];

        for (const poi of poisToGeocode) {
            if (poi.lat && poi.lng) {
                updatedPOIs.push(poi);
                continue;
            }

            await new Promise<void>((resolve) => {
                geocoder.geocode(
                    { address: `${poi.name}${city ? ", " + city : ""}` },
                    (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                            const loc = results[0].geometry.location;
                            poi.lat = loc.lat();
                            poi.lng = loc.lng();
                            poi.place_id = results[0].place_id;
                            updatedPOIs.push(poi);
                        } else {
                            console.warn(`Failed to geocode POI: ${poi.name}`, status);
                        }
                        resolve();
                    }
                );
            });
        }

        addMarkers(updatedPOIs);
    };

    // ✅ Add numbered red pins + route
    const addMarkers = (resolvedPOIs: POI[]) => {
        if (!mapInstance.current) return;
        const map = mapInstance.current!;
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }

        if (!resolvedPOIs || resolvedPOIs.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        const placesService = new google.maps.places.PlacesService(map);

        // 🎨 Route color (varies by day)
        const dayColors = ["#0078FF", "#34A853", "#FBBC05", "#EA4335"];
        const color = dayColors[dayIndex % dayColors.length];

        resolvedPOIs.forEach((poi, index) => {
            if (!poi.lat || !poi.lng) return;

            // ✅ Regular red pin with label
            const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map,
                title: `${index + 1}. ${poi.name}`,
                label: {
                    text: `${index + 1}`,
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                },
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // default red pin
                    labelOrigin: new google.maps.Point(15, 10), // center number
                },
            });

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

        if (!bounds.isEmpty()) map.fitBounds(bounds);

        // ✅ Draw route
        if (resolvedPOIs.length >= 2) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: { strokeColor: color, strokeWeight: 4 },
            });
            directionsRenderer.setMap(map);
            directionsRendererRef.current = directionsRenderer;

            const waypoints = resolvedPOIs.slice(1, -1).map((p) => ({
                location: { lat: p.lat!, lng: p.lng! },
                stopover: true,
            }));

            directionsService.route(
                {
                    origin: { lat: resolvedPOIs[0].lat!, lng: resolvedPOIs[0].lng! },
                    destination: {
                        lat: resolvedPOIs[resolvedPOIs.length - 1].lat!,
                        lng: resolvedPOIs[resolvedPOIs.length - 1].lng!,
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
    };

    // ✅ Handle city and POI updates
    useEffect(() => {
        if (city && city !== lastCityRef.current) {
            lastCityRef.current = city;
            geocodeCity(city);
        }
    }, [city]);

    useEffect(() => {
        if (pois && pois.length > 0) {
            geocodePOIs(pois);
        }
    }, [pois]);

    return (
        <div className="relative w-full h-full flex">
            <div ref={mapRef} className="flex-grow h-full rounded" />

            {selectedPlace && (
                <Draggable handle=".drag-handle" defaultPosition={{ x: 100, y: 100 }}>
                    <div className="fixed bg-white shadow-2xl rounded-2xl w-96 overflow-hidden z-50 cursor-move border">
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

                        {selectedPlace.photos?.[0] && (
                            <img
                                src={selectedPlace.photos[0].getUrl({ maxWidth: 600 })}
                                alt={selectedPlace.name}
                                className="w-full h-56 object-cover"
                            />
                        )}

                        <div className="p-4 space-y-2 text-gray-700">
                            <p>📍 {selectedPlace.formatted_address ?? "No address available"}</p>

                            {selectedPlace.rating && (
                                <p>⭐ {selectedPlace.rating.toFixed(1)} / 5</p>
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
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
    );
}

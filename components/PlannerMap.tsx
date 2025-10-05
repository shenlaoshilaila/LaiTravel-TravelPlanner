"use client";
import React, { useEffect, useRef } from "react";
import { POI } from "@/components/types";

interface PlannerMapProps {
    pois: POI[];
    city?: string;
}

export default function PlannerMap({ pois, city }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const routeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    // ✅ Initialize map only once
    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;

        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // default Beijing
                zoom: 12,
            });
            infoWindowRef.current = new google.maps.InfoWindow();
        }
    }, []);

    // ✅ Update markers + draw route when POIs change
    useEffect(() => {
        if (!mapInstance.current) return;

        // --- Clear old markers ---
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // --- Clear old route line ---
        if (routeRendererRef.current) {
            routeRendererRef.current.setMap(null);
            routeRendererRef.current = null;
        }

        if (pois.length > 0) {
            const bounds = new google.maps.LatLngBounds();

            // --- Add markers ---
            pois.forEach((poi) => {
                if (!poi.lat || !poi.lng || isNaN(poi.lat) || isNaN(poi.lng)) {
                    console.error("❌ Skipping invalid POI:", poi);
                    return;
                }

                const marker = new google.maps.Marker({
                    position: { lat: poi.lat, lng: poi.lng },
                    map: mapInstance.current!,
                    title: poi.name,
                });

                marker.addListener("click", () => {
                    infoWindowRef.current?.setContent(
                        `<div><strong>${poi.name}</strong></div>`
                    );
                    infoWindowRef.current?.open(mapInstance.current!, marker);
                });

                markersRef.current.push(marker);
                bounds.extend({ lat: poi.lat, lng: poi.lng });
            });

            mapInstance.current.fitBounds(bounds);

            // --- Draw route line between POIs ---
            if (pois.length >= 2) {
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer({
                    suppressMarkers: true, // we already have our markers
                    polylineOptions: {
                        strokeColor: "#1E90FF",
                        strokeOpacity: 0.8,
                        strokeWeight: 5,
                    },
                });
                directionsRenderer.setMap(mapInstance.current!);
                routeRendererRef.current = directionsRenderer;

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
                            console.warn("❌ Route request failed:", status);
                        }
                    }
                );
            }
        }
    }, [pois]);

    // ✅ Recenter map when city changes
    useEffect(() => {
        if (!mapInstance.current || !city) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: city }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                mapInstance.current!.setCenter(results[0].geometry.location);

                // Zoom in only if no POIs yet
                if (!pois || pois.length === 0) {
                    mapInstance.current!.setZoom(13);
                }
            } else {
                console.warn("❌ Geocode failed:", status);
            }
        });
    }, [city]);

    return <div ref={mapRef} className="w-full h-full rounded" />;
}

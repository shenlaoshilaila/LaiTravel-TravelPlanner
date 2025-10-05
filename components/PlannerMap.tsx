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

    // 🗺️ Initialize map once
    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;

        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // Default: Beijing
                zoom: 10,
            });
            infoWindowRef.current = new google.maps.InfoWindow();
        }
    }, []);

    // 📍 Update markers when POIs change
    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (pois.length > 0) {
            const bounds = new google.maps.LatLngBounds();

            pois.forEach((poi) => {
                if (!poi.lat || !poi.lng || isNaN(poi.lat) || isNaN(poi.lng)) {
                    console.error("Skipping invalid POI:", poi);
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
        }
    }, [pois]);

    // 🧭 Center map when city changes
    useEffect(() => {
        if (!mapInstance.current || !city) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: city }, (results, status) => {
            if (status === "OK" && results?.[0]) {
                const location = results[0].geometry.location;
                mapInstance.current!.panTo(location);
                mapInstance.current!.setZoom(12);
                console.log("✅ Map centered on:", city);
            } else {
                console.warn("❌ Geocode failed:", status);
            }
        });
    }, [city]);

    return <div ref={mapRef} className="w-full h-full" />;
}

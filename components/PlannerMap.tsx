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

    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (pois.length > 0) {
            const bounds = new google.maps.LatLngBounds();

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
        }
    }, [pois]);

    // ✅ New effect: Always re-center when city changes
    useEffect(() => {
        if (!mapInstance.current || !city) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: city }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                mapInstance.current!.setCenter(results[0].geometry.location);

                // Only zoom in if there are no POIs yet
                if (!pois || pois.length === 0) {
                    mapInstance.current!.setZoom(13);
                }
            } else {
                console.warn("❌ Geocode failed:", status);
            }
        });
    }, [city]);

    return <div ref={mapRef} className="w-full h-full" />;
}

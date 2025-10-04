"use client";
import React, { useEffect, useRef } from "react";
import { POI } from "@/components/types";

interface PlannerMapProps {
    pois: POI[];
}

export default function PlannerMap({ pois }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current || !(window as any).google) return;

        if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.9042, lng: 116.4074 }, // Beijing default
                zoom: 12,
            });
            infoWindowRef.current = new google.maps.InfoWindow();
        }
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;

        console.log("📌 POIs received by PlannerMap:", pois);

        // Clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        pois.forEach((poi) => {
            if (!poi.lat || !poi.lng || isNaN(poi.lat) || isNaN(poi.lng)) {
                console.error("❌ Skipping invalid POI:", poi);
                return;
            }

            console.log("✅ Adding marker:", poi);

            const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map: mapInstance.current!,
                title: poi.name,
            });

            markersRef.current.push(marker);

            // Simple InfoWindow for now
            marker.addListener("click", () => {
                infoWindowRef.current?.setContent(
                    `<div><strong>${poi.name}</strong><br/>Lat: ${poi.lat}, Lng: ${poi.lng}</div>`
                );
                infoWindowRef.current?.open(mapInstance.current!, marker);
            });
        });

        // Auto-center
        if (pois.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            pois.forEach((p) => {
                if (!isNaN(p.lat) && !isNaN(p.lng)) {
                    bounds.extend({ lat: p.lat, lng: p.lng });
                }
            });
            mapInstance.current.fitBounds(bounds);
        }
    }, [pois]);

    return <div ref={mapRef} className="w-full h-full" />;
}

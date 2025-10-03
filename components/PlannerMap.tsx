import React, { useEffect, useRef } from "react";
import { POI } from "./types";

interface PlannerMapProps {
    pois: POI[];
    className?: string;  // ✅ allow passing custom className
}

export default function PlannerMap({ pois, className }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const directionsService = useRef<google.maps.DirectionsService | null>(null);
    const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

    // Initialize map once
    useEffect(() => {
        if (mapRef.current && !mapInstance.current && (window as any).google) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 30.2741, lng: 120.1551 }, // Hangzhou default
                zoom: 12,
            });
            directionsService.current = new google.maps.DirectionsService();
            directionsRenderer.current = new google.maps.DirectionsRenderer({
                suppressMarkers: true, // ✅ so we can control markers
            });
            directionsRenderer.current.setMap(mapInstance.current);
        }
    }, []);

    // Update map when POIs change
    useEffect(() => {
        if (!mapInstance.current || !directionsService.current || !directionsRenderer.current) return;

        // Clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (pois.length === 0) {
            directionsRenderer.current.setDirections({ routes: [] } as any); // clear route
            return;
        }

        // Add markers
        pois.forEach((p, i) => {
            const marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: mapInstance.current!,
                label: `${i + 1}`, // number markers
                title: p.name,
            });
            markersRef.current.push(marker);
        });

        if (pois.length < 2) {
            directionsRenderer.current.setDirections({ routes: [] } as any); // no route
            return;
        }

        // Build route
        const waypoints = pois.slice(1, -1).map((p) => ({
            location: { lat: p.lat, lng: p.lng },
            stopover: true,
        }));

        directionsService.current.route(
            {
                origin: { lat: pois[0].lat, lng: pois[0].lng },
                destination: { lat: pois[pois.length - 1].lat, lng: pois[pois.length - 1].lng },
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.current?.setDirections(result);

                    // ✅ Auto fit map to route bounds
                    mapInstance.current?.fitBounds(result.routes[0].bounds);
                } else {
                    console.error("Directions failed:", status);
                }
            }
        );
    }, [pois]);

    return <div ref={mapRef} className={className ?? "w-full h-full"} />;
}

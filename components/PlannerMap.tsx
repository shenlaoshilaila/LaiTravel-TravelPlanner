import React, { useEffect, useRef } from "react";
import { POI } from "./types";

interface PlannerMapProps {
    pois: POI[];
}

export default function PlannerMap({ pois }: PlannerMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const directionsService = useRef<google.maps.DirectionsService | null>(null);
    const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current && (window as any).google) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 30.2741, lng: 120.1551 }, // Hangzhou default
                zoom: 12,
            });
            directionsService.current = new google.maps.DirectionsService();
            directionsRenderer.current = new google.maps.DirectionsRenderer({
                suppressMarkers: false,
            });
            directionsRenderer.current.setMap(mapInstance.current);
        }
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !directionsService.current || !directionsRenderer.current) return;

        if (pois.length < 2) {
            directionsRenderer.current.setDirections({ routes: [] } as any); // clear
            return;
        }

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
                } else {
                    console.error("Directions failed:", status);
                }
            }
        );
    }, [pois]);

    return <div ref={mapRef} className="w-full h-full" />;
}

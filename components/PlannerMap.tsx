// components/PlannerMap.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    useJsApiLoader,
} from "@react-google-maps/api";
import type { Library } from "@googlemaps/js-api-loader"; // type for `libraries`
import { POI } from "./types";

const containerStyle = { width: "100%", height: "500px" };
const DEFAULT_CENTER = { lat: 39.9042, lng: 116.4074 }; // Beijing default
const LIBRARIES: Library[] = ["places"];

type Props = {
    pois: POI[];
    center?: { lat: number; lng: number }; // ✅ optional map center override
    mode?: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";
    optimizeWaypoints?: boolean;
};

export default function PlannerMap({
                                       pois,
                                       center,
                                       mode = "DRIVING",
                                       optimizeWaypoints = false,
                                   }: Props) {
    // Load Maps JS once
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: LIBRARIES,
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);

    // ✅ Decide map center
    const mapCenter =
        center ??
        (pois.length > 0
            ? { lat: pois[0].lat, lng: pois[0].lng }
            : DEFAULT_CENTER);

    // 🔄 Recompute directions when POIs change
    useEffect(() => {
        if (!isLoaded) return;

        // If <2 POIs → just show markers, no directions
        if (pois.length < 2) {
            setDirections(null);
            return;
        }

        const origin = new google.maps.LatLng(pois[0].lat, pois[0].lng);
        const destination = new google.maps.LatLng(
            pois[pois.length - 1].lat,
            pois[pois.length - 1].lng
        );

        const waypoints: google.maps.DirectionsWaypoint[] =
            pois.length > 2
                ? pois.slice(1, -1).map((p) => ({
                    location: new google.maps.LatLng(p.lat, p.lng),
                    stopover: true,
                }))
                : [];

        const travelModeMap: Record<
            NonNullable<Props["mode"]>,
            google.maps.TravelMode
        > = {
            DRIVING: google.maps.TravelMode.DRIVING,
            WALKING: google.maps.TravelMode.WALKING,
            BICYCLING: google.maps.TravelMode.BICYCLING,
            TRANSIT: google.maps.TravelMode.TRANSIT,
        };

        const request: google.maps.DirectionsRequest = {
            origin,
            destination,
            waypoints,
            travelMode: travelModeMap[mode],
            optimizeWaypoints,
            provideRouteAlternatives: false,
        };

        let cancelled = false;

        (async () => {
            try {
                const service = new google.maps.DirectionsService();
                const result = await service.route(request);
                if (cancelled) return;

                setDirections(result);

                // ✅ Auto-fit to route bounds
                const route0 = result.routes?.[0];
                if (mapRef.current && route0?.bounds) {
                    mapRef.current.fitBounds(route0.bounds);
                }
            } catch (err) {
                console.error("Directions API failed:", err);
                if (!cancelled) setDirections(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isLoaded, pois, mode, optimizeWaypoints]);

    if (loadError) return <div>Map failed to load.</div>;
    if (!isLoaded) return <div>Loading map…</div>;

    return (
        <GoogleMap
            onLoad={(m: google.maps.Map) => {
                mapRef.current = m;
            }}
            mapContainerStyle={containerStyle}
            center={mapCenter} // ✅ dynamic city center
            zoom={12}
        >
            {/* 🔵 Place markers */}
            {pois.map((p, idx) => (
                <Marker
                    key={`${p.lat},${p.lng},${idx}`}
                    position={{ lat: p.lat, lng: p.lng }}
                    label={`${idx + 1}`}
                    title={p.name}
                />
            ))}

            {/* 🛣️ Show route */}
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true, // we already add markers
                        preserveViewport: true,
                        polylineOptions: { strokeWeight: 5, strokeOpacity: 0.8 },
                    }}
                />
            )}
        </GoogleMap>
    );
}

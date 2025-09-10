// components/PlannerMap.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    useJsApiLoader,
} from "@react-google-maps/api";
import type { Library } from "@googlemaps/js-api-loader"; // type for `libraries`
import { POI } from "./types";

const containerStyle = { width: "100%", height: "500px" };
const DEFAULT_CENTER = { lat: 39.9042, lng: 116.4074 }; // Beijing
const LIBRARIES: Library[] = ["places"];

type Props = {
    pois: POI[];
    mode?: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";
    optimizeWaypoints?: boolean;
};

export default function PlannerMap({
                                       pois,
                                       mode = "DRIVING",
                                       optimizeWaypoints = false,
                                   }: Props) {
    // Load Maps JS once (use your **browser** key)
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: LIBRARIES,
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);

    const center = useMemo(
        () => (pois.length ? { lat: pois[0].lat, lng: pois[0].lng } : DEFAULT_CENTER),
        [pois]
    );

    useEffect(() => {
        if (!isLoaded) return; // wait for Maps JS to be ready
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
                // Promise form avoids the callback overload issues
                const result = await service.route(request);
                if (cancelled) return;

                setDirections(result);

                const route0 = result.routes?.[0];
                if (mapRef.current && route0?.bounds) {
                    mapRef.current.fitBounds(route0.bounds);
                }
            } catch {
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
            // ✅ explicit type + block so the function returns void
            onLoad={(m: google.maps.Map) => {
                mapRef.current = m;
            }}
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
        >
            {pois.map((p, idx) => (
                <Marker
                    key={`${p.lat},${p.lng},${idx}`}
                    position={{ lat: p.lat, lng: p.lng }}
                    label={`${idx + 1}`}
                    title={p.name}
                />
            ))}

            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true,
                        preserveViewport: true,
                        polylineOptions: { strokeWeight: 5 },
                    }}
                />
            )}
        </GoogleMap>
    );
}

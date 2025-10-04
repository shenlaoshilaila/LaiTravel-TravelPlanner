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
                center: { lat: 39.9042, lng: 116.4074 }, // default Beijing
                zoom: 12,
            });
            infoWindowRef.current = new google.maps.InfoWindow();
        }
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        pois.forEach((poi) => {
            console.log("📍 Rendering POI on map:", poi);

            if (
                typeof poi.lat !== "number" ||
                typeof poi.lng !== "number" ||
                isNaN(poi.lat) ||
                isNaN(poi.lng)
            ) {
                console.error("❌ Invalid POI lat/lng:", poi);
                return;
            }

            const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map: mapInstance.current!,
                title: poi.name,
            });

            marker.addListener("click", () => {
                if (!poi.placeId) {
                    infoWindowRef.current?.setContent(`<div><strong>${poi.name}</strong><p>No details available.</p></div>`);
                    infoWindowRef.current?.open(mapInstance.current!, marker);
                    return;
                }

                const service = new google.maps.places.PlacesService(mapInstance.current!);
                service.getDetails(
                    {
                        placeId: poi.placeId,
                        fields: ["name", "formatted_address", "rating", "photos", "url"],
                    },
                    (place, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                            const photoUrl =
                                place.photos && place.photos.length > 0
                                    ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
                                    : null;

                            const content = `
                                <div style="max-width:300px">
                                    <h3 style="margin:0;font-size:16px;font-weight:bold;">${place.name}</h3>
                                    <p style="margin:4px 0;">📍 ${place.formatted_address || "No address"}</p>
                                    <p style="margin:4px 0;">⭐ Rating: ${place.rating || "N/A"}</p>
                                    ${photoUrl ? `<img src="${photoUrl}" alt="${place.name}" style="width:100%;border-radius:8px;margin-top:6px;" />` : ""}
                                    ${place.url ? `<p style="margin-top:6px;"><a href="${place.url}" target="_blank" style="color:blue">View on Google Maps</a></p>` : ""}
                                </div>
                            `;

                            infoWindowRef.current?.setContent(content);
                            infoWindowRef.current?.open(mapInstance.current!, marker);
                        } else {
                            infoWindowRef.current?.setContent(`<div><strong>${poi.name}</strong><p>Details unavailable</p></div>`);
                            infoWindowRef.current?.open(mapInstance.current!, marker);
                        }
                    }
                );
            });

            markersRef.current.push(marker);
        });

        // Auto-center map
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

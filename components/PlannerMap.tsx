"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { POI } from "./types";

const containerStyle = {
    width: "100%",
    height: "100%", // ✅ ensures it fills parent
};

const defaultCenter = { lat: 39.9042, lng: 116.4074 }; // Beijing fallback

interface Props {
    pois: POI[];
}

export default function PlannerMap({ pois }: Props) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    });

    if (!isLoaded) return <div className="w-full h-full">Loading map...</div>;

    const center =
        pois.length > 0
            ? { lat: pois[0].lat, lng: pois[0].lng }
            : defaultCenter;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
        >
            {pois.map((poi, i) => (
                <Marker key={i} position={{ lat: poi.lat, lng: poi.lng }} />
            ))}
        </GoogleMap>
    );
}

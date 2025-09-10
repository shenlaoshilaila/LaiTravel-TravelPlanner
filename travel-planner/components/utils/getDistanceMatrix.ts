// components/utils/getDistanceMatrix.ts

/**
 * Travel modes supported by the Routes API.
 * (Map your UI selection to these if needed.)
 */
export type TravelMode = "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";

/** Format meters to a user-friendly string. */
function fmtKm(meters?: number): string {
    if (typeof meters !== "number" || Number.isNaN(meters)) return "—";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

/** Format duration returned by Routes API (e.g. "1234s" or "PT23M15S"). */
function fmtDuration(d?: string): string {
    if (!d) return "—";
    const secMatch = d.match(/^(\d+)s$/i);
    let total = 0;
    if (secMatch) {
        total = parseInt(secMatch[1], 10);
    } else {
        const h = /(\d+)H/.exec(d)?.[1];
        const m = /(\d+)M/.exec(d)?.[1];
        const s = /(\d+)S/.exec(d)?.[1];
        total =
            (h ? parseInt(h, 10) * 3600 : 0) +
            (m ? parseInt(m, 10) * 60 : 0) +
            (s ? parseInt(s, 10) : 0);
    }
    const hrs = Math.floor(total / 3600);
    const mins = Math.round((total % 3600) / 60);
    return hrs ? `${hrs} hr ${mins} min` : `${mins} min`;
}

/**
 * Compute distance & duration for a single leg using the
 * Google Routes API (Directions v2).
 *
 * NOTE: This must run on the server (uses GOOGLE_MAPS_API_KEY).
 */
export async function getDistanceMatrix(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TravelMode = "DRIVE"
): Promise<{ distance: string; duration: string } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("❌ GOOGLE_MAPS_API_KEY not set in environment");
        return null;
    }

    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

    const body = {
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: mode, // "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT"
        computeTravelSummary: true
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                // Ask only for what we need to keep the response small.
                "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
            },
            body: JSON.stringify(body),
            cache: "no-store"
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Routes API HTTP error:", res.status, res.statusText);
            console.error("↳ Response:", JSON.stringify(data, null, 2));
            return null;
        }

        const route = data?.routes?.[0];
        if (!route) {
            console.error("❌ Routes API: no route in response:", JSON.stringify(data, null, 2));
            return null;
        }

        return {
            distance: fmtKm(route.distanceMeters),
            duration: fmtDuration(route.duration)
        };
    } catch (err) {
        console.error("⚠️ Routes API fetch failed:", err);
        return null;
    }
}

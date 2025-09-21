// Minimal example: Distance Matrix API
import type { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure server runtime (app router)

export async function POST(req: NextRequest) {
    const { origins, destinations, mode = "DRIVING" } = await req.json();

    const params = new URLSearchParams({
        origins: origins.map((o: {lat:number,lng:number}) => `${o.lat},${o.lng}`).join("|"),
        destinations: destinations.map((d: {lat:number,lng:number}) => `${d.lat},${d.lng}`).join("|"),
        mode: mode.toLowerCase(),
        key: process.env.GOOGLE_MAPS_API_KEY!, // keep this on server
    });

    const resp = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}`, {
        method: "GET",
    });
    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: 200 });
}

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? "✅ loaded" : "❌ missing",
        partial: process.env.GOOGLE_MAPS_API_KEY?.slice(0, 6) // just to confirm it's the right one
    });
}

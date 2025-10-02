// components/api.ts

// ✅ Your backend (Spring Boot + Cloud Run) base URL
const API_BASE = "https://travelplanner-720040112489.us-east1.run.app".replace(/\/+$/, "");

// --- 1. Backend POI search ---
export async function searchPois(city: string, keyword: string) {
  const url = `${API_BASE}/pois?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`;

  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include", // keep this only if using session cookies; remove for JWT
  });

  if (!res.ok) {
    throw new Error(`POI search failed: ${res.status}`);
  }

  return (await res.json()) as Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
}

// --- 2. Geocode a city name into lat/lng using Google Maps Geocoding API ---
export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    return data.results[0].geometry.location; // { lat, lng }
  }

  return null;
}

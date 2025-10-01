// components/api.ts

// Your backend (Spring Boot + Cloud Run) base URL
const API_BASE = "https://travelplanner-720040112489.us-east1.run.app".replace(/\/+$/, "");

// --- 1. Google Places Autocomplete (cities) ---
export async function fetchCitySuggestions(input: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Google Places API key is missing. Set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in .env.local");
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
  )}&types=(cities)&key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`City autocomplete failed: ${res.status}`);
  }

  const data = await res.json();

  // Map predictions into simplified objects
  return data.predictions.map((p: any) => ({
    description: p.description, // e.g. "Beijing, China"
    placeId: p.place_id,
  }));
}

// --- 2. Your backend POI search ---
export async function searchPois(city: string, keyword: string) {
  const url = `${API_BASE}/pois?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`;

  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include", // keep if you rely on session cookies, otherwise remove
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

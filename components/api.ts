// components/api.ts

// ✅ Backend base URL (Spring Boot + Cloud Run)
const API_BASE = "https://travelplanner-720040112489.us-east1.run.app".replace(/\/+$/, "");

/**
 * 🔎 1. Search POIs via backend
 * This hits your Spring Boot endpoint: /api/pois
 */
export async function searchPois(city: string, keyword: string) {
  if (!city?.trim() || !keyword?.trim()) {
    throw new Error("City and keyword are required for POI search");
  }

  // ✅ Matches PoiController -> @RequestMapping("/api") + @GetMapping("/pois")
  const url = `${API_BASE}/api/pois?city=${encodeURIComponent(city.trim())}&keyword=${encodeURIComponent(keyword.trim())}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include", // keep only if using session cookies; remove if using JWT auth
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POI search failed: ${res.status} - ${text}`);
    }

    return (await res.json()) as Array<{
      name: string;
      lat: number;
      lng: number;
    }>;
  } catch (err) {
    console.error("❌ Error during POI search:", err);
    throw err;
  }
}

/**
 * 🌍 2. Geocode a city name into { lat, lng } using Google Maps Geocoding API
 */
export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local");
  }

  if (!city?.trim()) {
    throw new Error("City name is required for geocoding");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city.trim())}&key=${apiKey}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Geocoding failed: ${res.status} - ${text}`);
    }

    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location; // ✅ { lat, lng }
    }

    console.warn("⚠️ Geocoding returned no results:", city, "->", data.status);
    return null;
  } catch (err) {
    console.error("❌ Error during geocoding:", err);
    throw err;
  }
}

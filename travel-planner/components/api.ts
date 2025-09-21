// components/api.ts
const API_BASE = "https://travelplanner-720040112489.us-east1.run.app".replace(/\/+$/, "");

export async function searchPois(city: string, keyword: string) {
  const url = `${API_BASE}/pois?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" }); // or remove credentials if not using cookies/JWT
  if (!res.ok) throw new Error(`POI search failed: ${res.status}`);
  return (await res.json()) as Array<{ name: string; lat: number; lng: number }>;
}

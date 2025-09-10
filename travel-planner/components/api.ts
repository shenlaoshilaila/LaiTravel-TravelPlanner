// components/api.ts
export async function searchPois(city: string, keyword: string) {
    const url = `http://localhost:8080/pois?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("POI search failed");
    return (await res.json()) as Array<{ name: string; lat: number; lng: number }>;
}

// Adjust this to your backend “save POI” endpoint


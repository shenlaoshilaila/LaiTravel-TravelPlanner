"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface POI {
    id?: string;
    name: string;
    lat: number;
    lng: number;
    sequence?: number;
    day?: number;
}
interface Itinerary {
    id: string;
    city: string;
    days: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    pois?: POI[];
}

/* ---------- helpers ---------- */
function toRad(deg: number) { return (deg * Math.PI) / 180; }
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function minsAtSpeed(km: number, kmh: number) { return (km / kmh) * 60; }
function formatMinutes(m: number) {
    const mins = Math.round(m); if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), mm = mins % 60; return mm ? `${h} h ${mm} min` : `${h} h`;
}
function formatKm(km: number) { return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`; }

export default function ItineraryDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [data, setData] = useState<Itinerary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setError(null);
                const res = await fetch(
                    `https://travelplanner-720040112489.us-east1.run.app/api/itinerary/${id}`,
                    {
                        credentials: "include",
                        headers: { Accept: "application/json" },
                    }
                );
                if (res.status === 401) { router.push("/login"); return; }
                if (!res.ok) throw new Error(`Failed to load itinerary ${id}: ${res.status} ${res.statusText}`);
                setData((await res.json()) as Itinerary);
            } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
            finally { setLoading(false); }
        })();
    }, [id, router]);

    // Group POIs by day & sort by sequence
    const grouped = useMemo(() => {
        const map = new Map<number, POI[]>(); const pois = data?.pois ?? [];
        for (const p of pois) { const d = p.day ?? 1; if (!map.has(d)) map.set(d, []); map.get(d)!.push(p); }
        for (const [d, arr] of map) arr.sort((a,b)=> (a.sequence??1e9) - (b.sequence??1e9));
        return Array.from(map.entries()).sort((a,b)=>a[0]-b[0]);
    }, [data?.pois]);

    if (loading) return <div className="p-6">Loading…</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!data) return <div className="p-6">Not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2">{data.city}</h1>
            <p className="text-gray-600 mb-1">{data.days} day{data.days !== 1 ? "s" : ""}</p>
            <p className="text-sm text-gray-400 mb-6">Created: {new Date(data.createdAt).toLocaleDateString()}</p>

            {grouped.length ? (
                <div className="space-y-8">
                    {grouped.map(([day, pois]) => {
                        let dayTotalKm = 0;
                        const segments = pois.length >= 2
                            ? pois.slice(0, -1).map((from, idx) => {
                                const to = pois[idx + 1];
                                const dKm = haversineKm({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
                                dayTotalKm += dKm;
                                return { dKm, walkMins: minsAtSpeed(dKm, 4.8), driveMins: minsAtSpeed(dKm, 35) };
                            })
                            : [];

                        return (
                            <section key={day} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-semibold">Day {day}</h2>
                                    {segments.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                            Total (straight-line): <span className="font-medium">{formatKm(dayTotalKm)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {pois.map((p, i) => (
                                        <div key={`${p.id ?? i}`}>
                                            <div className="font-semibold text-2xl mb-1">{p.name}</div>

                                            {i < pois.length - 1 && (
                                                <div className="pl-3 mt-1 mb-3 text-sm text-gray-600 flex items-center">
                                                    <span className="inline-block mr-2 text-lg">↓</span>
                                                    <span>{formatKm(segments[i].dKm)}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>~{formatMinutes(segments[i].walkMins)} walk</span>
                                                    <span className="mx-2">/</span>
                                                    <span>~{formatMinutes(segments[i].driveMins)} drive</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {pois.length < 2 && (
                                        <div className="text-sm text-gray-500">
                                            Add another stop to see distance/time between places.
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            ) : (
                <div className="text-gray-500">No POIs yet.</div>
            )}
        </div>
    );
}

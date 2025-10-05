"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { POI, DayPOI } from "@/components/types";
import { groupPOIsByDay } from "@/components/utils/groupByDay";
import PlannerMap from "@/components/PlannerMap";

const API_BASE = "https://travelplanner-720040112489.us-east1.run.app";

export default function ItineraryPage() {
    const { id } = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/itinerary/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPlan(data);
                }
            } catch (e) {
                console.error("Fetch itinerary failed:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <p className="p-6">Loading itinerary...</p>;
    if (!plan) return <p className="p-6">Itinerary not found</p>;

    // ✅ Convert Map → DayPOI[]
    const grouped = groupPOIsByDay(plan.pois);
    const byDay: DayPOI[] = Array.from(grouped.entries()).map(([day, pois]) => ({
        day,
        city: pois[0]?.city ?? "",
        date: pois[0]?.date ?? "",
        pois,
    }));

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">{plan.city || "Itinerary"}</h1>

            {byDay.map(({ day, city, date, pois }) => (
                <div
                    key={day}
                    className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
                >
                    <h2 className="font-semibold text-lg">
                        Day {day} — {city || "No city selected"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {date ? new Date(date).toDateString() : ""}
                    </p>

                    <ul className="list-disc pl-5">
                        {pois.map((poi: POI, i: number) => (
                            <li key={i}>
                                {poi.name}{" "}
                                <span className="text-gray-500 text-sm">
                  ({poi.lat?.toFixed(3)}, {poi.lng?.toFixed(3)})
                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Optional map per day */}
                    {pois.length > 0 && (
                        <div className="h-64 mt-2 border rounded">
                            <PlannerMap city={city} pois={pois} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

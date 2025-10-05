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

    // 🔐 Fetch itinerary data from backend
    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/itinerary/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPlan(data);
                }
            } catch (err) {
                console.error("Failed to fetch itinerary:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <p className="p-6">Loading itinerary...</p>;
    if (!plan) return <p className="p-6">Itinerary not found</p>;

    // ✅ Directly use the array returned by groupPOIsByDay
    const byDay: DayPOI[] = groupPOIsByDay(plan.pois);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-4">
                {plan.city || "Itinerary Overview"}
            </h1>

            {/* Render grouped days */}
            {byDay.map(({ day, city, date, pois }) => (
                <div
                    key={day}
                    className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
                >
                    <h2 className="font-semibold text-lg">
                        Day {day} — {city || "No city selected"}
                    </h2>

                    {date && (
                        <p className="text-sm text-gray-500">
                            {new Date(date).toDateString()}
                        </p>
                    )}

                    {/* POI List */}
                    <ul className="list-disc pl-5 text-gray-800">
                        {pois.map((poi: POI, i: number) => (
                            <li key={i}>
                                {poi.name}
                                {poi.lat && poi.lng && (
                                    <span className="text-gray-500 text-sm ml-2">
                    ({poi.lat.toFixed(3)}, {poi.lng.toFixed(3)})
                  </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Optional map for each day */}
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

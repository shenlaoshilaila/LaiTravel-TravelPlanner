"use client";
import React, { useState, useEffect, useMemo } from "react";
import PlannerForm from "@/components/PlannerForm";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI } from "@/components/types";
import { useRouter } from "next/navigation";
import AIChatBar from "@/components/AIChatBar";
import { geocodeCity } from "@/components/api"; // ✅ import geocoding helper

const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

type User = { id: string; name?: string } | null;

export default function PlannerPage() {
    const router = useRouter();

    const [city, setCity] = useState<string>(""); // dynamic city
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null); // ✅ map center
    const [days, setDays] = useState(1);
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);

    const [user, setUser] = useState<User>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // 🔐 Fetch current user (auth)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch(`${BACKEND_URL}/auth/me`, {
                    credentials: "include",
                });
                if (r.ok) {
                    const u = await r.json();
                    if (!cancelled) setUser(u);
                }
            } catch (error) {
                console.error("Auth error:", error);
            } finally {
                if (!cancelled) setAuthChecked(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // 🔄 Update dayPOIs whenever days changes
    useEffect(() => {
        setDayPOIs((prev) => {
            const updated: DayPOI[] = [];
            for (let i = 1; i <= days; i++) {
                const existing = prev.find((d) => d.day === i);
                updated.push({ day: i, pois: existing?.pois ?? [] });
            }
            return updated;
        });
        setSelectedDay(1);
    }, [days]);

    // 🌍 Geocode city when it changes
    useEffect(() => {
        if (!city) return;
        (async () => {
            try {
                const coords = await geocodeCity(city);
                if (coords) {
                    setMapCenter(coords);
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        })();
    }, [city]);

    const updatePOIsForDay = (day: number, newPois: POI[]) => {
        setDayPOIs((prev) =>
            prev.map((d) =>
                d.day === day
                    ? { ...d, pois: newPois.map((p, i) => ({ ...p, sequence: i + 1 })) }
                    : d
            )
        );
    };

    const allPois = useMemo(
        () =>
            dayPOIs.flatMap((d) =>
                d.pois.map((poi, i) => ({
                    ...poi,
                    day: d.day,
                    sequence: i + 1,
                }))
            ),
        [dayPOIs]
    );

    const currentDayPois =
        selectedDay ? dayPOIs.find((d) => d.day === selectedDay)?.pois ?? [] : [];

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Itinerary Planner {city && `- ${city}`}
                </h1>
                {authChecked && (
                    <span className="text-xs px-2 py-1 rounded bg-slate-100">
            {user ? `Signed in` : `Guest mode`}
          </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Form + Days */}
                <div>
                    <PlannerForm
                        city={city}
                        days={days}
                        onCityChange={setCity}
                        onDaysChange={setDays}
                    />

                    <div className="mt-6 space-y-6">
                        <h2 className="text-lg font-semibold">Your Itinerary by Day</h2>

                        {dayPOIs.map(({ day, pois }) => (
                            <DayPOISection
                                key={day}
                                day={day}
                                city={city}
                                initialPois={pois}
                                onUpdatePois={(d, updated) => updatePOIsForDay(d, updated)}
                                onSelectDay={(d) => setSelectedDay(d)}
                                isActive={selectedDay === day}
                                backendUrl={BACKEND_URL}
                            />
                        ))}

                        {user ? (
                            <SavePlanButton
                                planData={{ city, days, pois: allPois }}
                                onPlanSaved={(saved) => {
                                    const id =
                                        (saved as any)?.plan?.id ?? (saved as any)?.id;
                                    if (id) router.push(`/planner/${id}`);
                                    else
                                        console.warn(
                                            "Saved, but no id returned from backend."
                                        );
                                }}
                                backendUrl={BACKEND_URL}
                            />
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 rounded bg-gray-300 text-gray-600 cursor-not-allowed"
                                title="Log in to save your plan"
                            >
                                Log in to save plan
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Map */}
                <div className="h-[500px]">
                    <PlannerMap
                        pois={currentDayPois}
                        center={mapCenter ?? { lat: 39.9042, lng: 116.4074 }} // ✅ default Beijing until user picks city
                    />
                </div>
            </div>

            <AIChatBar
                city={city}
                days={days}
                selectedDay={selectedDay}
                dayPOIs={dayPOIs}
            />
        </main>
    );
}

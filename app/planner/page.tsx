"use client";
import React, { useState, useEffect, useMemo } from "react";
import PlannerForm from "@/components/PlannerForm";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI } from "@/components/types";
import { useRouter } from "next/navigation";
import AIChatBar from "@/components/AIChatBar";

// Define your backend URL directly
const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

type User = { id: string; name?: string } | null;

export default function PlannerPage() {
    const router = useRouter();

    const [city, setCity] = useState("Beijing");
    const [days, setDays] = useState(1);
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);

    // Auth is OPTIONAL: we fetch it, but never block rendering.
    const [user, setUser] = useState<User>(null);
    const [authChecked, setAuthChecked] = useState(false);

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
                // If 401 or any error, we stay as guest (null user).
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
                    Itinerary Planner - {city}
                </h1>
                {/* Tiny status chip (optional) */}
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

                    {/* Removed Search for POIs Section */}

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

                        {/* Save plan: enabled only when signed in */}
                        {user ? (
                            <SavePlanButton
                                planData={{ city, days, pois: allPois }}
                                onPlanSaved={(saved) => {
                                    const id = (saved as any)?.plan?.id ?? (saved as any)?.id;
                                    if (id) router.push(`/planner/${id}`);
                                    else console.warn("Saved, but no id returned from backend.");
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

                {/* Right: Map — always renders for guests too */}
                <div className="h-[500px]">
                    <PlannerMap pois={currentDayPois} />
                </div>
            </div>

            {/* Floating AI Chat Bar */}
            <AIChatBar
                city={city}
                days={days}
                selectedDay={selectedDay}
                dayPOIs={dayPOIs}
            />
        </main>
    );
}

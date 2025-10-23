"use client";

import React, { useEffect, useState, useMemo } from "react";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI } from "@/components/types";
import { useRouter } from "next/navigation";
import AIChatBar from "@/components/AIChatBar";
import AIChatPlannerBar from "@/components/AIChatPlannerBar";
import FlightDateExtractor from "@/components/FlightDateExtractor";

const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

type User = { id: string; name?: string } | null;

export default function PlannerPage() {
    const router = useRouter();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);
    const [user, setUser] = useState<User>(null);
    const [errorMsg, setErrorMsg] = useState("");

    // ---------- AUTH ----------
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${BACKEND_URL}/auth/me`, {
                    credentials: "include",
                });
                if (r.ok) setUser(await r.json());
            } catch (e) {
                console.warn("Auth error", e);
            }
        })();
    }, []);

    // ---------- DATE HANDLING ----------
    useEffect(() => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) return;

        const newDays: DayPOI[] = [];
        let dayCount = 1;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            newDays.push({
                day: dayCount,
                date: d.toISOString().split("T")[0],
                city: "",
                pois: [],
            });
            dayCount++;
        }
        setDayPOIs(newDays);
        setSelectedDay(1);
    }, [startDate, endDate]);

    // ---------- UPDATE + GLOBAL REMOVE ----------
    const handleCityChange = (day: number, city: string) => {
        setDayPOIs((prev) =>
            prev.map((d) => (d.day === day ? { ...d, city } : d))
        );
    };

    const updatePOIsForDay = (day: number, newPois: POI[]) => {
        setDayPOIs((prev) =>
            prev.map((d) =>
                d.day === day
                    ? { ...d, pois: newPois.map((p, i) => ({ ...p, sequence: i + 1 })) }
                    : d
            )
        );
    };

    // ✅ Remove a POI across all days (cross-date removal)
    const handleRemovePOIGlobally = (poiToRemove: POI) => {
        setDayPOIs((prev) =>
            prev.map((day) => ({
                ...day,
                pois: day.pois.filter(
                    (p) => p.name.toLowerCase() !== poiToRemove.name.toLowerCase()
                ),
            }))
        );
    };

    const allPois = useMemo(
        () =>
            dayPOIs.flatMap((d) =>
                d.pois.map((poi, i) => ({
                    ...poi,
                    city: d.city,
                    day: d.day,
                    date: d.date,
                    sequence: i + 1,
                }))
            ),
        [dayPOIs]
    );

    const currentDayPois =
        selectedDay ? dayPOIs.find((d) => d.day === selectedDay)?.pois ?? [] : [];
    const currentCity =
        selectedDay ? dayPOIs.find((d) => d.day === selectedDay)?.city ?? "" : "";

    // ---------- RENDER ----------
    return (
        <main className="flex flex-col max-w-full min-h-screen overflow-hidden bg-white">
            {/* Header */}
            <header className="p-4 border-b bg-blue-50 sticky top-0 z-20 shadow-sm">
                <h1 className="text-2xl font-bold">Itinerary Planner</h1>
            </header>

            {/* Layout */}
            <div className="flex flex-1 w-full">
                {/* LEFT PANEL */}
                <div
                    className="p-4 bg-gray-50 flex flex-col"
                    style={{
                        width: "50%",
                        height: "calc(100vh - 64px)",
                    }}
                >
                    <div className="flex-1 overflow-y-auto">
                        {dayPOIs.map(({ day, date, city, pois }) => (
                            <DayPOISection
                                key={day}
                                day={day}
                                date={date ?? ""}
                                city={city ?? ""}
                                initialPois={pois}
                                onUpdatePois={updatePOIsForDay}
                                onSelectDay={setSelectedDay}
                                onCityChange={handleCityChange}
                                isActive={selectedDay === day}
                                backendUrl={BACKEND_URL}
                                onRemovePOIGlobally={handleRemovePOIGlobally}
                            />
                        ))}
                    </div>

                    <div className="pt-3 border-t bg-gray-50 sticky bottom-0">
                        {user ? (
                            <SavePlanButton
                                planData={{ startDate, endDate, pois: allPois }}
                                onPlanSaved={(saved) => {
                                    const id =
                                        (saved as any)?.plan?.id ?? (saved as any)?.id;
                                    if (id) router.push(`/planner/${id}`);
                                }}
                                backendUrl={BACKEND_URL}
                            />
                        ) : (
                            <button
                                disabled
                                className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
                            >
                                Login to Save
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL (Map) */}
                <div
                    className="p-4"
                    style={{
                        flexGrow: 1,
                        height: "calc(100vh - 64px)",
                    }}
                >
                    <div className="h-full w-full border rounded shadow">
                        <PlannerMap
                            city={currentCity}
                            pois={currentDayPois}
                            onCityResolved={(resolvedCity: string) => {
                                if (!resolvedCity) return;
                                setDayPOIs((prev) =>
                                    prev.map((d) => {
                                        if (!d.city || d.city === currentCity) {
                                            return { ...d, city: resolvedCity };
                                        }
                                        return d;
                                    })
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

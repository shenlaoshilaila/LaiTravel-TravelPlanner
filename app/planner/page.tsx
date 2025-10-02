"use client";
import React, { useState, useEffect, useMemo } from "react";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI, PlanData } from "@/components/types";
import { useRouter } from "next/navigation";
import AIChatBar from "@/components/AIChatBar";

const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

type User = { id: string; name?: string } | null;

export default function PlannerPage() {
    const router = useRouter();

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);

    const [user, setUser] = useState<User>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // 🔐 Fetch current user
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${BACKEND_URL}/auth/me`, {
                    credentials: "include",
                });
                if (r.ok) {
                    setUser(await r.json());
                }
            } catch (e) {
                console.warn("Auth error", e);
            } finally {
                setAuthChecked(true);
            }
        })();
    }, []);

    // 🗓️ Generate days when startDate & endDate are selected
    useEffect(() => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) return; // invalid range

        const newDays: DayPOI[] = [];
        let dayCount = 1;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            newDays.push({
                day: dayCount,
                date: d.toISOString().split("T")[0], // yyyy-mm-dd
                city: "",
                pois: [],
            });
            dayCount++;
        }
        setDayPOIs(newDays);
        setSelectedDay(1);
    }, [startDate, endDate]);

    // ✅ Update city for a day
    const handleCityChange = (day: number, city: string) => {
        setDayPOIs((prev) =>
            prev.map((d) => (d.day === day ? { ...d, city } : d))
        );
    };

    // ✅ Update POIs for a day
    const updatePOIsForDay = (day: number, newPois: POI[]) => {
        setDayPOIs((prev) =>
            prev.map((d) =>
                d.day === day
                    ? {
                        ...d,
                        pois: newPois.map((p, i) => ({
                            ...p,
                            sequence: i + 1,
                            date: d.date, // ✅ tie POIs to actual date
                        })),
                    }
                    : d
            )
        );
    };

    // ✅ Flatten all POIs
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

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Itinerary Planner</h1>

            {/* 🗓️ Date Range Input */}
            <div className="flex gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border px-3 py-2 rounded"
                    />
                </div>
            </div>

            {/* Per-Day Sections */}
            {dayPOIs.map(({ day, date, city, pois }) => (
                <DayPOISection
                    key={day}
                    day={day}
                    date={date}
                    city={city}
                    initialPois={pois}
                    onUpdatePois={updatePOIsForDay}
                    onSelectDay={setSelectedDay}
                    onCityChange={handleCityChange}
                    isActive={selectedDay === day}
                    backendUrl={BACKEND_URL}
                />
            ))}

            {/* Save Button */}
            {user ? (
                <SavePlanButton
                    planData={{ startDate, endDate, pois: allPois } as PlanData}
                    onPlanSaved={(saved) => {
                        const id = (saved as any)?.plan?.id ?? (saved as any)?.id;
                        if (id) router.push(`/planner/${id}`);
                    }}
                    backendUrl={BACKEND_URL}
                />
            ) : (
                <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
                >
                    Login to Save
                </button>
            )}

            {/* Map */}
            <div className="h-[500px] mt-6">
                <PlannerMap pois={currentDayPois} />
            </div>

            <AIChatBar
                city=""
                days={dayPOIs.length}
                selectedDay={selectedDay}
                dayPOIs={dayPOIs}
            />
        </main>
    );
}

"use client";
import React, { useState, useEffect, useMemo } from "react";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI } from "@/components/types";
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
                date: d.toISOString().split("T")[0],
                city: "",
                pois: [],
            } as any);
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

    // --- Resizable Split Pane state ---
    const [leftWidth, setLeftWidth] = useState(40); // percentage
    const handleDrag = (e: React.MouseEvent) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    };

    return (
        <main className="h-screen flex flex-col max-w-full">
            {/* Header */}
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold">Itinerary Planner</h1>
            </header>

            {/* Split Pane */}
            <div className="flex flex-1 w-full overflow-hidden">
                {/* LEFT: Planner Controls */}
                <div
                    className="p-4 overflow-y-auto"
                    style={{ width: `${leftWidth}%`, minWidth: "20%" }}
                >
                    {/* Date Range Input */}
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
                    <div className="space-y-6">
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
                    </div>

                    {/* Save Button */}
                    <div className="mt-6">
                        {user ? (
                            <SavePlanButton
                                planData={{ startDate, endDate, pois: allPois }}
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
                    </div>
                </div>

                {/* DRAG HANDLE */}
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const move = (ev: MouseEvent) => handleDrag(ev as any);
                        const up = () => {
                            window.removeEventListener("mousemove", move);
                            window.removeEventListener("mouseup", up);
                        };
                        window.addEventListener("mousemove", move);
                        window.addEventListener("mouseup", up);
                    }}
                    className="w-2 bg-gray-300 cursor-col-resize hover:bg-gray-400"
                />

                {/* RIGHT: Map fills full height */}
                <div className="flex-1 flex">
                    <PlannerMap pois={currentDayPois} className="flex-1 h-full w-full" />
                </div>
            </div>

            {/* Bottom Assistant */}
            <AIChatBar
                city=""
                days={dayPOIs.length}
                selectedDay={selectedDay}
                dayPOIs={dayPOIs}
            />
        </main>
    );
}

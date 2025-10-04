"use client";
import React, { useEffect, useState, useMemo } from "react";
import DayPOISection from "@/components/DayPOISection";
import PlannerMap from "@/components/PlannerMap";
import SavePlanButton from "@/components/SavePlanButton";
import { POI, DayPOI } from "@/components/types";
import { useRouter } from "next/navigation";
import AIChatBar from "@/components/AIChatBar";
import FlightDateExtractor from "@/components/FlightDateExtractor";

const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

type User = { id: string; name?: string } | null;

export default function PlannerPage() {
    const router = useRouter();

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);
    const [user, setUser] = useState<User>(null);

    const [detectedDates, setDetectedDates] = useState<
        { start: string; end: string }[]
    >([]);

    // --- Resizable Split Pane state ---
    const [leftWidth, setLeftWidth] = useState(50);
    const handleDrag = (e: MouseEvent) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
            setLeftWidth(newWidth);
        }
    };

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        window.addEventListener("mousemove", handleDrag);
        window.addEventListener("mouseup", stopDrag);
    };

    const stopDrag = () => {
        window.removeEventListener("mousemove", handleDrag);
        window.removeEventListener("mouseup", stopDrag);
    };

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

    return (
        <main className="flex flex-col max-w-full h-screen">
            {/* Header */}
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold">Itinerary Planner</h1>
            </header>

            {/* Flight Date Extractor */}
            <div className="p-4 border-b">
                <FlightDateExtractor
                    onSelect={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    onReset={() => {
                        setStartDate("");
                        setEndDate("");
                        setDetectedDates([]);
                    }}
                />
            </div>

            {/* Split Pane */}
            <div className="flex flex-1 w-full">
                {/* LEFT: Planner Controls */}
                <div
                    className="p-4 overflow-y-auto"
                    style={{
                        width: `${leftWidth}%`,
                        minWidth: "20%",
                        maxHeight: "calc(100vh - 160px)",
                    }}
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
                                date={date ?? ""}
                                city={city ?? ""}
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
                    onMouseDown={startDrag}
                    className="w-2 bg-gray-300 cursor-col-resize hover:bg-gray-400"
                />

                {/* RIGHT: Map */}
                <div
                    className="p-4"
                    style={{ flexGrow: 1, width: `${100 - leftWidth}%`, minWidth: "20%" }}
                >
                    <div className="h-full w-full border rounded shadow">
                        <PlannerMap pois={currentDayPois} />
                    </div>
                </div>
            </div>

            {/* Floating AI Assistant */}
            <AIChatBar
                city=""
                days={dayPOIs.length}
                selectedDay={selectedDay}
                dayPOIs={dayPOIs}
            />
        </main>
    );
}

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

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);
    const [user, setUser] = useState<User>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const [leftWidth, setLeftWidth] = useState(50);
    const handleDrag = (e: MouseEvent) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
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

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" });
                if (r.ok) setUser(await r.json());
            } catch (e) {
                console.warn("Auth error", e);
            }
        })();
    }, []);

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

    const handleAIPlanGenerated = (aiDayPOIs: DayPOI[]) => {
        if (!aiDayPOIs || aiDayPOIs.length === 0) return;

        const firstCity = aiDayPOIs[0]?.city?.trim() || "";

        if (!firstCity.includes(",")) {
            setErrorMsg(
                "⚠️ Please include the country name in your query (e.g., 'Hangzhou, China')."
            );
            return;
        } else {
            setErrorMsg("");
        }

        setDayPOIs([]);
        setTimeout(() => {
            setDayPOIs(aiDayPOIs);
            setStartDate(aiDayPOIs[0]?.date || "");
            setEndDate(aiDayPOIs[aiDayPOIs.length - 1]?.date || "");
            setSelectedDay(1);
        }, 50);
    };

    return (
        <main className="flex flex-col max-w-full min-h-screen overflow-y-auto bg-white">
            <header className="p-4 border-b bg-blue-50 sticky top-0 z-20 shadow-sm">
                <h1 className="text-2xl font-bold">Itinerary Planner</h1>
            </header>

            {/* Step 1: Trip Assistant */}
            <div className="p-4 border-b bg-white">
                <h2 className="text-lg font-semibold mb-2 text-blue-700">
                    Step 1 · Trip Assistant
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                    Ask anything — destinations, safety, attractions, or travel advice.
                </p>
                <div className="border rounded-lg shadow-sm bg-gray-50 p-3">
                    <AIChatBar
                        city=""
                        days={dayPOIs.length}
                        selectedDay={selectedDay}
                        dayPOIs={dayPOIs}
                        embedMode={true}
                    />
                </div>
            </div>

            {/* Step 2: Auto-Fill */}
            <div className="p-4 border-b bg-blue-50">
                <h2 className="text-lg font-semibold mb-2 text-green-700">
                    Step 2 · Auto-Fill Assistant
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                    Type the city and country name (for accuracy). Example:
                    <br />
                    <span className="italic text-gray-500">
            Hangzhou, China 10/1–10/3 (nature & food), Shanghai, China 10/4–10/6
            (shopping)
          </span>
                </p>
                <div className="border rounded-lg shadow-sm bg-white p-3">
                    <AIChatPlannerBar onPlanGenerated={handleAIPlanGenerated} />
                </div>
                {errorMsg && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errorMsg}</p>
                )}
            </div>

            <div className="p-4 border-b bg-white">
                <FlightDateExtractor
                    onSelect={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    onReset={() => {
                        setStartDate("");
                        setEndDate("");
                    }}
                />
            </div>

            <div className="flex flex-1 w-full">
                <div
                    className="p-4 overflow-y-auto bg-gray-50"
                    style={{
                        width: `${leftWidth}%`,
                        minWidth: "20%",
                        maxHeight: "calc(100vh - 160px)",
                    }}
                >
                    <div className="flex gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Start Date
                            </label>
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

                <div
                    onMouseDown={startDrag}
                    className="w-2 bg-gray-300 cursor-col-resize hover:bg-gray-400"
                />

                <div
                    className="p-4"
                    style={{ flexGrow: 1, width: `${100 - leftWidth}%`, minWidth: "20%" }}
                >
                    <div className="h-[700px] w-full border rounded shadow">
                        <PlannerMap
                            city={currentCity}
                            pois={currentDayPois}
                            onCityResolved={(resolvedCity: string) => {
                                if (resolvedCity && resolvedCity !== currentCity && selectedDay) {
                                    setTimeout(() => {
                                        handleCityChange(selectedDay, resolvedCity);
                                    }, 300);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

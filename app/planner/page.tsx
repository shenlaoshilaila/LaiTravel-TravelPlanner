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

    const [days, setDays] = useState(1);
    const [dayPOIs, setDayPOIs] = useState<DayPOI[]>([{ day: 1, city: "", pois: [] }]);
    const [selectedDay, setSelectedDay] = useState<number | null>(1);

    const [user, setUser] = useState<User>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // 🔐 Fetch current user
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" });
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

    // 🔄 When days changes, adjust dayPOIs length
    useEffect(() => {
        setDayPOIs((prev) => {
            const updated: DayPOI[] = [];
            for (let i = 1; i <= days; i++) {
                const existing = prev.find((d) => d.day === i);
                updated.push(existing ?? { day: i, city: "", pois: [] });
            }
            return updated;
        });
    }, [days]);

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
                    city: d.city, // ✅ include city with each POI
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
            <h1 className="text-2xl font-bold mb-4">Itinerary Planner</h1>

            {/* Per-Day Sections */}
            {dayPOIs.map(({ day, city, pois }) => (
                <DayPOISection
                    key={day}
                    day={day}
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
                    planData={{ days, pois: allPois }}
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

            {/* Right Side Map */}
            <div className="h-[500px] mt-6">
                <PlannerMap pois={currentDayPois} />
            </div>

            <AIChatBar city="" days={days} selectedDay={selectedDay} dayPOIs={dayPOIs} />
        </main>
    );
}

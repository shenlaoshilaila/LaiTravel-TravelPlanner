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
    const [searchKeyword, setSearchKeyword] = useState("MALL");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

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

    // Function to search for POIs
    const searchPOIs = async (city: string, keyword: string) => {
        setIsSearching(true);
        setSearchError(null);
        
        try {
            const response = await fetch(
                `${BACKEND_URL}/pois?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pois: POI[] = await response.json();
            
            // Update the first day with the search results
            if (pois.length > 0) {
                updatePOIsForDay(1, pois);
            } else {
                setSearchError("No results found for your search.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchError("Failed to search for POIs. Please try again.");
        } finally {
            setIsSearching(false);
        }
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

                    {/* Search Section */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Search for POIs</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Enter keyword (e.g., MALL)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                                onClick={() => searchPOIs(city, searchKeyword)}
                                disabled={isSearching}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </div>
                        {searchError && (
                            <p className="text-red-500 text-sm mt-2">{searchError}</p>
                        )}
                    </div>

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

            {/* Floating AI Chat Bar (renders for guests; your backend can decide what features need auth) */}
            <AIChatBar 
                city={city} 
                days={days} 
                selectedDay={selectedDay} 
                dayPOIs={dayPOIs} 

            />
        </main>
    );
}

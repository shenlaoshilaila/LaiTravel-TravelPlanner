"use client";
import React from "react";
import DayPOISection from "./DayPOISection";
import { DayPOI, POI } from "./types";

interface ItineraryViewerProps {
  id: string;
  city: string;
  poisByDay: DayPOI[]; // Initial data (e.g., from server)
  onPoisChanged?: (all: POI[]) => void;
}

// 🔹 Backend URL
const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

export default function ItineraryViewer({
                                          id,
                                          city,
                                          poisByDay,
                                          onPoisChanged,
                                        }: ItineraryViewerProps) {
  const [unsavedPOIs, setUnsavedPOIs] = React.useState<DayPOI[]>(poisByDay);
  const [activeDay, setActiveDay] = React.useState<number>(
      poisByDay[0]?.day ?? 1
  );

  // ✅ Track per-day city if needed
  const [citiesByDay, setCitiesByDay] = React.useState<Record<number, string>>(
      () => Object.fromEntries(poisByDay.map((d) => [d.day, city]))
  );

  // ✅ Update local POIs when changed
  const handleUpdatePois = (day: number, nextForDay: POI[]) => {
    const next = unsavedPOIs.map((d) =>
        d.day === day ? { ...d, pois: nextForDay } : d
    );
    setUnsavedPOIs(next);
    onPoisChanged?.(next.flatMap((d) => d.pois));
  };

  // ✅ Handle city change per day
  const handleCityChange = (day: number, newCity: string) => {
    setCitiesByDay((prev) => ({ ...prev, [day]: newCity }));
  };

  // ✅ Save all POIs to backend
  const handleSavePlan = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/itinerary/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: unsavedPOIs, cities: citiesByDay }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save plan. Please try again.");
    }
  };

  // ✅ Simple haversine driving time mock
  function getDrivingTime(p1: POI, p2: POI): string {
    if (!p1 || !p2) return "";
    const R = 6371; // km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    const timeMin = Math.round((distance / 40) * 60); // average 40 km/h
    return `${timeMin || 5} min drive`;
  }

  // ✅ Render
  return (
      <div className="space-y-4">
        {unsavedPOIs.map(({ day, date, pois }) => (
            <div key={day} className="space-y-2">
              <DayPOISection
                  day={day}
                  date={date ?? ""} // ✅ fix for undefined date
                  city={citiesByDay[day] ?? city}
                  initialPois={pois}
                  isActive={activeDay === day}
                  onSelectDay={setActiveDay}
                  onUpdatePois={handleUpdatePois}
                  onCityChange={handleCityChange}
                  backendUrl={BACKEND_URL}
              />

              {/* 🚗 Driving time between POIs */}
              {pois.length > 1 && (
                  <ol className="pl-8">
                    {pois.map((p, i) =>
                        i < pois.length - 1 ? (
                            <li
                                key={i}
                                className="flex items-center text-blue-600 text-sm my-1"
                            >
                              <span className="inline-block mr-2">🚗</span>
                              {getDrivingTime(p, pois[i + 1])}
                            </li>
                        ) : null
                    )}
                  </ol>
              )}
            </div>
        ))}

        {/* 💾 Save button */}
        <button
            onClick={handleSavePlan}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          Save All Changes
        </button>
      </div>
  );
}

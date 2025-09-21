// components/ItineraryViewer.tsx
"use client";
import React from "react";
import DayPOISection from "./DayPOISection";
import { DayPOI, POI } from "./types";

// 🔑 Centralize backend URL
const BACKEND_URL = "https://travelplanner-720040112489.us-east1.run.app";

interface ItineraryViewerProps {
  id: string;
  city: string;
  poisByDay: DayPOI[]; // Initial data (e.g., from server)
  onPoisChanged?: (all: POI[]) => void;
}

export default function ItineraryViewer({
                                          id,
                                          city,
                                          poisByDay,
                                          onPoisChanged,
                                        }: ItineraryViewerProps) {
  // 1. Local state for unsaved changes (initialized with props)
  const [unsavedPOIs, setUnsavedPOIs] = React.useState<DayPOI[]>(poisByDay);
  const [activeDay, setActiveDay] = React.useState<number>(
      poisByDay[0]?.day ?? 1
  );

  // 2. Update local state when POIs change
  const handleUpdatePois = (day: number, nextForDay: POI[]) => {
    const next = unsavedPOIs.map((d) =>
        d.day === day ? { ...d, pois: nextForDay } : d
    );
    setUnsavedPOIs(next);
    onPoisChanged?.(next.flatMap((d) => d.pois)); // Notify parent (e.g., map)
  };

  // 3. Save all POIs to backend
  const handleSavePlan = async () => {
    try {
      const res = await fetch(`/api/itinerary/${id}/save`, {
        method: "POST",
        body: JSON.stringify({ days: unsavedPOIs }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
      <div className="space-y-4">
        {/* Render each day's POIs with driving time between them */}
        {unsavedPOIs.map(({ day, pois }) => (
            <div key={day} className="space-y-2">
              <DayPOISection
                  day={day}
                  city={city}
                  itineraryId={id}
                  initialPois={pois}
                  isActive={activeDay === day}
                  onSelectDay={setActiveDay}
                  onUpdatePois={handleUpdatePois}
                  backendUrl={BACKEND_URL}   // ✅ added
              />
              {/* Driving time section between POIs */}
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

        {/* Add a save button */}
        <button
            onClick={handleSavePlan}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save All Changes
        </button>
      </div>
  );

  // Helper to calculate driving time (mock, replace with real API if needed)
  function getDrivingTime(p1: POI, p2: POI): string {
    if (!p1 || !p2) return "";
    const R = 6371; // km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km
    const timeMin = Math.round((distance / 40) * 60);
    return `${timeMin || 5} min drive`;
  }
}

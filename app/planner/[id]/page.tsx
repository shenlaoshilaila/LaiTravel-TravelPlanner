// app/planner/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { POI, DayPOI } from "@/components/types";
import { groupPOIsByDay } from "@/components/utils/groupByDay";

const API_BASE = "https://travelplanner-720040112489.us-east1.run.app";
const SHOW_PATH = "/api/itinerary";
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // ✅ must be public key

interface ItineraryResponse {
  id: string | number;
  city: string;
  pois: POI[];
}

export default function PlannerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(`${API_BASE}${SHOW_PATH}/${id}`, {
          credentials: "include", // ✅ browser will send cookies
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch itinerary (${res.status})`);
        }

        const raw = await res.json();
        // sanitize response
        setPlan({
          id: raw.id,
          city: raw.city,
          pois: Array.isArray(raw.pois) ? raw.pois : [],
        });
      } catch (err: any) {
        setError(err.message || "Error loading itinerary");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) return <p className="p-6">Loading itinerary...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!plan) return <p className="p-6">Itinerary not found</p>;

  const byDay: DayPOI[] = groupPOIsByDay(plan.pois);

  return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">This is your plan</h1>
          <span className="text-gray-600">{plan.city}</span>
        </header>

        {byDay.map(({ day, pois }) => (
            <section key={day} className="rounded-xl border p-4 bg-white">
              <h2 className="font-medium mb-3">Day {day}</h2>
              {pois.length === 0 ? (
                  <p className="text-sm text-gray-500">No POIs for this day.</p>
              ) : (
                  <ol className="list-decimal pl-5 space-y-2">
                    {pois.map((p, i) => (
                        <li key={i} className="text-gray-800">
                          {p.name}
                          {typeof p.lat === "number" && typeof p.lng === "number" && (
                              <span className="text-gray-500 text-sm">
                      {" "}
                                ({p.lat.toFixed(5)}, {p.lng.toFixed(5)})
                    </span>
                          )}
                        </li>
                    ))}
                  </ol>
              )}
            </section>
        ))}
      </div>
  );
}

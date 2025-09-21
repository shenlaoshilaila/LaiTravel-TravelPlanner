// components/SavePlanButton.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PlanSavedResponse, SavePlanButtonProps, POI, DayPOI } from "./types";

// Convert either DayPOI[] or POI[] into a flat POI[]
function toFlatPois(poisGroupedOrFlat: DayPOI[] | POI[]): POI[] {
    if (!poisGroupedOrFlat || (poisGroupedOrFlat as any[]).length === 0) return [];
    const first: any = (poisGroupedOrFlat as any[])[0];

    if (first && typeof first === "object" && "pois" in first) {
        // DayPOI[]
        const byDay = poisGroupedOrFlat as DayPOI[];
        const out: POI[] = [];
        for (const d of byDay) {
            for (const p of d.pois) {
                out.push({ ...p, day: d.day });
            }
        }
        return out.sort((a, b) => a.day - b.day || a.sequence - b.sequence);
    }

    // Already flat POI[]
    const flat = poisGroupedOrFlat as POI[];
    return flat.slice().sort((a, b) => a.day - b.day || a.sequence - b.sequence);
}

export default function SavePlanButton({
                                           planData,
                                           onPlanSaved,
                                           backendUrl, // ✅ ADDED
                                       }: SavePlanButtonProps & { backendUrl: string }) { // ✅ ADDED backendUrl to props
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Adjust to your AuthContext shape
    const auth = useAuth() as unknown as {
        jwt?: string | null;
        accessToken?: string | null;
    };

    const handleSavePlan = async () => {
        setIsSaving(true);
        setMessage("");

        try {
            // 1) Build payload
            const backendFormat = {
                city: planData.city,
                days: planData.days,
                pois: toFlatPois(planData.pois),
            };

            // 2) Headers
            const bearer = auth?.jwt ?? auth?.accessToken ?? null;
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (bearer) headers.Authorization = `Bearer ${bearer}`;

            // 3) POST - ✅ UPDATED: Use backendUrl prop instead of hardcoded API_BASE
            const res = await fetch(`${backendUrl}/api/itinerary`, {
                method: "POST",
                headers,
                credentials: "include", // keep if JWT cookie/session is used
                body: JSON.stringify(backendFormat),
            });

            if (res.status === 401) {
                setMessage("Please login to save plans");
                return;
            }
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`Save failed: ${res.status} ${t}`);
            }

            // 4) Parse response body safely
            let saved: PlanSavedResponse | undefined;
            let savedId: string | undefined;

            const text = await res.text();
            if (text) {
                try {
                    saved = JSON.parse(text) as PlanSavedResponse;
                    savedId = (saved as any)?.id ?? (saved as any)?.plan?.id;
                } catch {
                    // ignore parse errors if body is empty or not JSON
                }
            }

            // 5) Fallback to Location header
            if (!savedId) {
                const loc = res.headers.get("Location") || res.headers.get("location");
                if (loc) {
                    const parts = loc.split("/").filter(Boolean);
                    savedId = parts[parts.length - 1];
                }
            }

            // 6) Trigger callback defensively
            onPlanSaved?.(saved ?? ({ id: savedId } as any));
            setMessage("Plan saved successfully!");
        } catch (e: any) {
            console.error("Save error:", e);
            setMessage(e?.message ?? "Error saving plan");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleSavePlan}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isSaving ? "Saving..." : "Save Plan"}
            </button>
            {message && <p className="mt-2 text-sm">{message}</p>}
        </div>
    );
}
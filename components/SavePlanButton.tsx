"use client";
import React, { useState } from "react";

export interface SavePlanButtonProps {
    planData: {
        startDate: string;
        endDate: string;
        pois: {
            city?: string;
            day: number;
            date?: string;
            name: string;
            lat: number;
            lng: number;
            sequence: number;
        }[];
    };
    onPlanSaved: (saved: { plan?: { id?: string }; id?: string }) => void;
    backendUrl: string;
}

export default function SavePlanButton({
                                           planData,
                                           onPlanSaved,
                                           backendUrl,
                                       }: SavePlanButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${backendUrl}/itinerary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(planData),
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                onPlanSaved(data);
            } else {
                console.error("Failed to save plan", res.statusText);
            }
        } catch (e) {
            console.error("Error saving plan", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
            {loading ? "Saving..." : "Save Plan"}
        </button>
    );
}

"use client";
import React, { useState } from "react";
import { DayPOI } from "./types";

interface AIChatPlannerBarProps {
    onPlanGenerated: (data: DayPOI[]) => void;
}

export default function AIChatPlannerBar({ onPlanGenerated }: AIChatPlannerBarProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [reply, setReply] = useState("");

    const handleAskAI = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setReply("");

        try {
            const res = await fetch("/api/ai-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();
            console.log("🧭 AI itinerary response:", data);

            if (data.dayPOIs) {
                // ✅ Pass structured POIs to PlannerPage
                onPlanGenerated(data.dayPOIs);
                setReply("✅ I've filled your planner with suggested POIs for each day!");
            } else if (data.error) {
                setReply("⚠️ " + data.error);
            } else {
                setReply("⚠️ Unexpected response from AI.");
            }
        } catch (err) {
            console.error("AIChatPlannerBar error:", err);
            setReply("⚠️ Failed to contact AI service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Type your trip details:
            </label>
            <input
                type="text"
                placeholder="e.g. Hangzhou, China 10/3–10/4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border px-3 py-2 rounded w-full"
            />
            <button
                onClick={handleAskAI}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                {loading ? "Loading..." : "Ask AI"}
            </button>
            {reply && <p className="text-sm text-gray-700 mt-2">{reply}</p>}
        </div>
    );
}

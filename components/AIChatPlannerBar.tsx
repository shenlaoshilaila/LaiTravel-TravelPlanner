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
            console.log("🧭 COMPLETE AI itinerary response:", data);
            console.log("🧭 Response keys:", Object.keys(data));

            if (data.dayPOIs) {
                console.log("🧭 First day structure:", data.dayPOIs[0]);
                console.log("🧭 First day keys:", data.dayPOIs[0] ? Object.keys(data.dayPOIs[0]) : 'no days');
            }

            // ✅ FIX: Handle different response structures
            let dayPOIs = data.dayPOIs || data.days || data.itinerary || data.data;

            // If it's a string, try to parse it
            if (typeof dayPOIs === 'string') {
                try {
                    dayPOIs = JSON.parse(dayPOIs);
                } catch (e) {
                    console.error("Failed to parse AI response:", e);
                }
            }

            console.log("✅ Processed dayPOIs:", dayPOIs);

            if (dayPOIs && Array.isArray(dayPOIs) && dayPOIs.length > 0) {
                // ✅ Pass structured POIs to PlannerPage
                onPlanGenerated(dayPOIs);
                setReply(`✅ I've filled your planner with ${dayPOIs.length} days of activities!`);
            } else if (data.error) {
                setReply("⚠️ " + data.error);
            } else if (data.message) {
                setReply("⚠️ " + data.message);
            } else {
                setReply("⚠️ Could not generate itinerary from the AI response.");
                console.warn("Unexpected AI response structure:", data);
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
                placeholder="e.g. Hangzhou, China 10/3–10/5 (nature & temples), Shanghai 10/6–10/8 (shopping & museums)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAskAI();
                }}
            />
            <button
                onClick={handleAskAI}
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? "Generating Itinerary..." : "Auto-Fill with AI"}
            </button>
            {reply && (
                <p className={`text-sm mt-2 ${
                    reply.includes("✅") ? "text-green-700" : "text-red-700"
                }`}>
                    {reply}
                </p>
            )}
        </div>
    );
}
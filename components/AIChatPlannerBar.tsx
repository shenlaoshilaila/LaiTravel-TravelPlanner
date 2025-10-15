"use client";
import React, { useState } from "react";
import { DayPOI } from "./types";

interface AIChatPlannerBarProps {
    onPlanGenerated: (dayPOIs: DayPOI[]) => void;
}

export default function AIChatPlannerBar({ onPlanGenerated }: AIChatPlannerBarProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(
        "💬 Do you want me to auto-fill the planner for you? Tell me each city name and the dates you’ll spend there, and your preferences if you like!"
    );

    // ✅ Common country words (to detect if the user already included one)
    const countryRegex =
        /(china|usa|united states|japan|france|italy|spain|germany|canada|uk|england|australia|korea|india|thailand)/i;

    // --- Basic validation for city/date presence ---
    const validateInput = (text: string) => {
        const hasCity = /[A-Z][a-z]+/i.test(text);
        const hasDate = /\d{1,2}[/\-]\d{1,2}/.test(text) || /\d{4}-\d{2}-\d{2}/.test(text);
        if (!hasCity && !hasDate)
            return "⚠️ Please include at least one city name and the dates you'll be there.";
        if (!hasCity) return "⚠️ Please tell me which cities you’ll visit.";
        if (!hasDate) return "⚠️ Please include dates for each city.";
        return null;
    };

    const handleAsk = async () => {
        const validation = validateInput(query);
        if (validation) {
            setMessage(validation);
            return;
        }

        // ✅ Check if user forgot to mention the country
        if (!countryRegex.test(query)) {
            setMessage(
                "🌍 Could you please tell me which country this city is in? For example: ‘Hangzhou, China 10/4–10/5’"
            );
            return; // stop here until user adds the country
        }

        // ✅ Proceed with request since we have both city and country
        setLoading(true);
        setMessage("✈️ Planning your itinerary...");

        try {
            const res = await fetch("/api/ai-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();

            if (data.dayPOIs) {
                onPlanGenerated(data.dayPOIs);
                setMessage("✅ I’ve filled your planner with suggested POIs for each day!");
            } else if (data.reply) {
                setMessage(data.reply);
            } else {
                setMessage("⚠️ I couldn’t generate any POIs. Try giving me more details.");
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Something went wrong while generating your plan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-blue-50 border-b p-4 flex flex-col gap-3 rounded-md shadow-sm">
            <p className="text-md text-gray-800 whitespace-pre-wrap">{message}</p>

            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Hangzhou, China 10/1–10/3 (nature & food), Shanghai, China 10/4–10/6 (shopping)"
                    className="border px-3 py-2 rounded flex-1"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
                >
                    {loading ? "Planning..." : "Ask AI"}
                </button>
            </div>
        </div>
    );
}

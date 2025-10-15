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
        "💬 Do you want me to auto-fill the planner for you? Tell me each city name and the dates you’ll spend there (and preferences if you like)."
    );

    // ✅ quick reference for common world cities
    const cityCountryMap: Record<string, string> = {
        hangzhou: "Hangzhou, China",
        shanghai: "Shanghai, China",
        beijing: "Beijing, China",
        tokyo: "Tokyo, Japan",
        osaka: "Osaka, Japan",
        kyoto: "Kyoto, Japan",
        paris: "Paris, France",
        rome: "Rome, Italy",
        london: "London, UK",
        newyork: "New York, USA",
        losangeles: "Los Angeles, USA",
        sydney: "Sydney, Australia",
        toronto: "Toronto, Canada",
    };

    // --- Basic validation for city/date presence ---
    const validateInput = (text: string) => {
        const hasCity = /[A-Za-z]+/.test(text);
        const hasDate = /\d{1,2}[/\-]\d{1,2}/.test(text) || /\d{4}-\d{2}-\d{2}/.test(text);
        if (!hasCity && !hasDate)
            return "⚠️ Please include at least one city name and the dates you'll be there.";
        if (!hasCity) return "⚠️ Please tell me which cities you’ll visit.";
        if (!hasDate) return "⚠️ Please include dates for each city.";
        return null;
    };

    // ✅ enrich the query with country if missing
    const ensureCountry = (text: string): string => {
        // if already has comma or country word
        if (/[,，]/.test(text) || /(china|usa|japan|france|italy|spain|germany|canada|uk|australia)/i.test(text))
            return text;

        // try match first city word
        const firstWord = text.split(/[ ,]/)[0].toLowerCase();
        if (cityCountryMap[firstWord]) {
            return text.replace(new RegExp(firstWord, "i"), cityCountryMap[firstWord]);
        }

        // fallback — ask user to specify
        setMessage(
            "🌍 I couldn’t detect the country. Please include the country name (e.g., 'Hangzhou, China')."
        );
        return "";
    };

    const handleAsk = async () => {
        const validation = validateInput(query);
        if (validation) {
            setMessage(validation);
            return;
        }

        // enrich with country
        const finalQuery = ensureCountry(query);
        if (!finalQuery) return;

        setLoading(true);
        setMessage("✈️ Planning your itinerary...");
        try {
            const res = await fetch("/api/ai-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: finalQuery }),
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
                    placeholder="e.g. Hangzhou, China 10/1–10/3 (nature & food), Shanghai 10/4–10/6 (shopping)"
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

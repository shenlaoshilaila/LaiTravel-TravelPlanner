"use client";
import React, { useState } from "react";
import { fetchCitySuggestions } from "./api";

interface PlannerFormProps {
    city: string;
    days: number;
    onCityChange: (city: string) => void;
    onDaysChange: (days: number) => void;
}

export default function PlannerForm({
                                        city,
                                        days,
                                        onCityChange,
                                        onDaysChange,
                                    }: PlannerFormProps) {
    const [suggestions, setSuggestions] = useState<
        { description: string; placeId: string }[]
    >([]);
    const [loading, setLoading] = useState(false);

    const handleCityInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onCityChange(value);

        if (value.length > 1) {
            setLoading(true);
            try {
                const results = await fetchCitySuggestions(value);
                console.log("✅ Suggestions from Google:", results); // debug
                setSuggestions(results);
            } catch (err) {
                console.error("❌ City autocomplete error:", err);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (description: string) => {
        onCityChange(description);
        setSuggestions([]); // close dropdown
    };

    return (
        <div className="space-y-4">
            {/* City autocomplete input */}
            <div className="relative">
                <label className="block font-medium mb-1">Select City:</label>
                <input
                    type="text"
                    value={city}
                    onChange={handleCityInput}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Start typing a city..."
                />

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto z-10">
                        {suggestions.map((s) => (
                            <li
                                key={s.placeId}
                                onClick={() => handleSelect(s.description)}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {s.description}
                            </li>
                        ))}
                    </ul>
                )}

                {loading && (
                    <div className="absolute right-2 top-2 text-sm text-gray-400">
                        Loading…
                    </div>
                )}
            </div>

            {/* Travel days input */}
            <div>
                <label className="block font-medium mb-1">Travel Days:</label>
                <input
                    type="number"
                    value={days}
                    min={1}
                    max={15}
                    onChange={(e) => onDaysChange(parseInt(e.target.value))}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>
        </div>
    );
}

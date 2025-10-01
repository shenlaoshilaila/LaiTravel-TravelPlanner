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

    const handleCityInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onCityChange(value);

        if (value.length > 1) {
            try {
                const results = await fetchCitySuggestions(value);
                setSuggestions(results);
            } catch (err) {
                console.error("City autocomplete error:", err);
            }
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div className="space-y-4">
            {/* City autocomplete input */}
            <div>
                <label className="block font-medium">Select City:</label>
                <input
                    type="text"
                    value={city}
                    onChange={handleCityInput}
                    className="w-full border px-3 py-1 rounded"
                    placeholder="Start typing a city..."
                />

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                    <ul className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((s) => (
                            <li
                                key={s.placeId}
                                onClick={() => {
                                    onCityChange(s.description); // set city name
                                    setSuggestions([]); // clear dropdown
                                }}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {s.description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Travel days input */}
            <div>
                <label className="block font-medium">Travel Days:</label>
                <input
                    type="number"
                    value={days}
                    min={1}
                    max={15}
                    onChange={(e) => onDaysChange(parseInt(e.target.value))}
                    className="w-full border px-3 py-1 rounded"
                />
            </div>
        </div>
    );
}

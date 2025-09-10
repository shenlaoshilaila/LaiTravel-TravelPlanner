"use client";
import React, { useState } from "react";

// ✅ Keep only one correct prop definition
export interface SearchBarProps {
    onSearch: (poiName: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setQuery(""); // clear input
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
                type="text"
                value={query}
                placeholder="Search for attractions..."
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border px-3 py-2 rounded"
            />
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Add
            </button>
        </form>
    );
}

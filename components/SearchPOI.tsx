"use client";
import React, { useState } from "react";
import { searchPois } from "./api";

type PoiLite = { name: string; lat: number; lng: number };

interface SearchPOIProps {
    city: string;
    onPick: (poi: PoiLite) => void;
    placeholder?: string;
}

export default function SearchPOI({
                                      city,
                                      onPick,
                                      placeholder = "Search POI…",
                                  }: SearchPOIProps) {
    const [q, setQ] = useState<string>("");
    const [results, setResults] = useState<PoiLite[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = async () => {
        const citySafe = city || "Beijing";
        if (!q.trim()) return;
        setLoading(true);
        try {
            const data = await searchPois(city, q); // GET /pois
            setResults(data);
            setOpen(true);
        } catch {
            setResults([]);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 border px-3 py-2 rounded"
                />
                <button onClick={handleSearch} className="px-4 py-2 rounded bg-blue-500 text-white">
                    {loading ? "…" : "Search"}
                </button>
            </div>

            {open && results.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow z-10">
                    {results.map((r, i) => (
                        <button
                            key={`${r.name}-${i}`}
                            onClick={() => {
                                onPick(r);
                                setOpen(false);
                                setQ("");
                                setResults([]);
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                            {r.name} <span className="opacity-60 text-sm">
                ({r.lat.toFixed(4)}, {r.lng.toFixed(4)})
              </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

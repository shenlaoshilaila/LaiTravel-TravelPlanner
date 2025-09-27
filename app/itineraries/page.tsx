// app/itineraries/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Itinerary {
    id: string;
    city: string;
    days: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

const API_BASE = "https://travelplanner-720040112489.us-east1.run.app";

export default function ItinerariesPage() {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMyItineraries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchMyItineraries = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/api/itinerary/mine`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            // ✅ Treat both 401 and 403 as "not logged in"
            if (response.status === 401 || response.status === 403) {
                setIsAuthenticated(false);
                setItineraries([]);
                return;
            }

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch itineraries: ${response.status} ${response.statusText}`
                );
            }

            const data = (await response.json()) as Itinerary[];

            // ✅ newest first (by createdAt)
            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setItineraries(sorted);
            setIsAuthenticated(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while fetching itineraries"
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteItinerary = async (id: string) => {
        const confirmed = window.confirm(
            "Delete this itinerary? This cannot be undone."
        );
        if (!confirmed) return;

        setDeletingIds((prev) => new Set(prev).add(id));
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/itinerary/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 401 || res.status === 403) {
                setIsAuthenticated(false);
                return;
            }
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Delete failed (HTTP ${res.status})`);
            }

            // Remove from UI (list already sorted by createdAt)
            setItineraries((prev) => prev.filter((i) => i.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete itinerary");
        } finally {
            setDeletingIds((prev) => {
                const copy = new Set(prev);
                copy.delete(id);
                return copy;
            });
        }
    };

    const formatDateRange = (startDate?: string, endDate?: string): string => {
        if (!startDate || !endDate) return "";
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        } catch {
            return "Invalid date format";
        }
    };

    if (loading)
        return (
            <div className="p-8 flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading your itineraries...</span>
            </div>
        );

    if (error)
        return (
            <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Error</h2>
                <p>{error}</p>
                <button
                    onClick={fetchMyItineraries}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Itineraries</h1>
                {isAuthenticated && (
                    <Link
                        href="/planner"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create New Itinerary
                    </Link>
                )}
            </div>

            {itineraries.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    {isAuthenticated === false ? (
                        <>
                            <div className="text-6xl mb-4">🔒</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Authentication Required
                            </h2>
                            <p className="text-gray-600 text-lg mb-6">
                                Please log in to view your itineraries.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Log In
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">🗺️</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                No Itineraries Yet
                            </h2>
                            <p className="text-gray-600 text-lg mb-6">
                                You haven't created any itineraries yet.
                            </p>
                            <Link
                                href="/planner"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create your first itinerary
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-600">
                            You have {itineraries.length} itinerary
                            {itineraries.length !== 1 ? "s" : ""}
                        </p>
                        <Link
                            href="/planner"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <i className="fas fa-plus mr-2"></i>Add New
                        </Link>
                    </div>

                    {/* One itinerary per row, newest first */}
                    <div className="space-y-4">
                        {itineraries.map((itinerary, idx) => {
                            const isDeleting = deletingIds.has(itinerary.id);
                            const isNewest = idx === 0; // top row after sorting
                            return (
                                <div
                                    key={itinerary.id}
                                    className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-xl text-gray-800">
                                                    {itinerary.city}
                                                </h3>
                                                {isNewest && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Newest
                          </span>
                                                )}
                                            </div>

                                            <p className="text-gray-600 mt-1">
                                                <span className="font-medium">{itinerary.days}</span>{" "}
                                                day{itinerary.days !== 1 ? "s" : ""}
                                            </p>

                                            {itinerary.startDate && itinerary.endDate && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDateRange(
                                                        itinerary.startDate,
                                                        itinerary.endDate
                                                    )}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-400 mt-2">
                                                Created:{" "}
                                                {new Date(itinerary.createdAt).toLocaleDateString()}
                                            </p>

                                            <div className="mt-3">
                                                <Link
                                                    href={`/itineraries/${itinerary.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                >
                                                    View Details <span className="ml-1">→</span>
                                                </Link>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteItinerary(itinerary.id)}
                                            disabled={isDeleting}
                                            className="ml-3 h-9 px-3 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                            aria-label={`Delete ${itinerary.city} itinerary`}
                                        >
                                            {isDeleting ? "Deleting…" : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

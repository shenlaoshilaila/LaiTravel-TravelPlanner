"use client";
import React, { useState } from "react";
import Tesseract from "tesseract.js";

interface FlightDateExtractorProps {
    onSelect: (start: string, end: string) => void;
    onReset: () => void;
}

export default function FlightDateExtractor({
                                                onSelect,
                                                onReset,
                                            }: FlightDateExtractorProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dates, setDates] = useState<string[]>([]);
    const [selectedStart, setSelectedStart] = useState<string | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false); // ✅ NEW

    // 📌 Handle file upload + OCR
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setLoading(true);
        setError(null);

        try {
            const { data } = await Tesseract.recognize(file, "eng");
            console.log("OCR Text:", data.text);

            // 🔍 Regex for "Jun 19, 2025"
            const dateRegex =
                /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/g;
            const matches = data.text.match(dateRegex) || [];

            if (matches.length < 1) {
                setError("No dates found in screenshot.");
                setDates([]);
                setLoading(false);
                return;
            }

            setDates(matches);
        } catch (err) {
            console.error("OCR failed:", err);
            setError("Failed to process image.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedStart && selectedEnd) {
            onSelect(selectedStart, selectedEnd);
            setConfirmed(true); // ✅ Hide section after confirmation
        } else {
            alert("Please select both a start and an end date.");
        }
    };

    const handleReset = () => {
        setSelectedStart(null);
        setSelectedEnd(null);
        setDates([]);
        setPreview(null);
        setConfirmed(false);
        onReset();
    };

    return (
        <div>
            {!confirmed ? (
                <>
                    <h3 className="font-semibold mb-2">Upload Flight Screenshot:</h3>

                    {/* Upload Input */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="mb-4"
                    />

                    {/* Preview */}
                    {preview && (
                        <div className="mb-4">
                            <img
                                src={preview}
                                alt="Uploaded preview"
                                className="max-h-48 rounded"
                            />
                        </div>
                    )}

                    {loading && <p className="text-blue-500">Processing image...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <h3 className="font-semibold mb-2">Detected Dates:</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {dates.length > 0 ? (
                            dates.map((date, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (!selectedStart) {
                                            setSelectedStart(date);
                                        } else if (!selectedEnd) {
                                            setSelectedEnd(date);
                                        } else {
                                            alert("You already picked start and end. Reset to pick again.");
                                        }
                                    }}
                                    className={`border p-2 rounded hover:bg-blue-100 ${
                                        selectedStart === date
                                            ? "bg-green-200"
                                            : selectedEnd === date
                                                ? "bg-yellow-200"
                                                : ""
                                    }`}
                                >
                                    {new Date(date).toDateString()}
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No dates detected yet.</p>
                        )}
                    </div>

                    {/* Selected Summary */}
                    <div className="mt-4">
                        <p>
                            Start Date:{" "}
                            <span className="font-medium">
                {selectedStart
                    ? new Date(selectedStart).toDateString()
                    : "Not set"}
              </span>
                        </p>
                        <p>
                            End Date:{" "}
                            <span className="font-medium">
                {selectedEnd
                    ? new Date(selectedEnd).toDateString()
                    : "Not set"}
              </span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleConfirm}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Confirm Dates
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            Reset
                        </button>
                    </div>
                </>
            ) : (
                // ✅ Show only summary after confirmation
                <div className="mt-4 p-4 border rounded bg-green-50">
                    <h4 className="font-semibold mb-2">Confirmed Travel Dates</h4>
                    <p>
                        Start Date:{" "}
                        <span className="font-medium">
              {selectedStart ? new Date(selectedStart).toDateString() : ""}
            </span>
                    </p>
                    <p>
                        End Date:{" "}
                        <span className="font-medium">
              {selectedEnd ? new Date(selectedEnd).toDateString() : ""}
            </span>
                    </p>
                    <button
                        onClick={handleReset}
                        className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Reset & Re-pick
                    </button>
                </div>
            )}
        </div>
    );
}

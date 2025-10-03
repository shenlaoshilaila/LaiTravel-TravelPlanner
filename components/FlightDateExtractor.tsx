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
    const [dates, setDates] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const extractDates = (text: string) => {
        const dateRegex =
            /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s\d{1,2},?\s\d{4}\b/g;

        const found = text.match(dateRegex) || [];

        const normalized = found
            .map((d) => {
                const parsed = new Date(d.replace(/,/g, ""));
                return isNaN(parsed.getTime())
                    ? null
                    : parsed.toISOString().split("T")[0];
            })
            .filter((d): d is string => d !== null);

        setDates(normalized);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            setPreview(reader.result as string);
            setLoading(true);

            try {
                const { data } = await Tesseract.recognize(reader.result as string, "eng");
                extractDates(data.text);
            } catch (err) {
                console.error("OCR failed:", err);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            onSelect(startDate, endDate);
            setConfirmed(true); // ✅ Hide UI after confirming
        }
    };

    const handleReset = () => {
        setPreview(null);
        setDates([]);
        setStartDate(null);
        setEndDate(null);
        setConfirmed(false);
        onReset();
    };

    if (confirmed) {
        return (
            <div className="p-4 border rounded bg-gray-50">
                <h3 className="font-semibold mb-2">Selected Dates:</h3>
                <p>
                    Start Date: <span className="font-semibold">{startDate}</span>
                </p>
                <p>
                    End Date: <span className="font-semibold">{endDate}</span>
                </p>
                <button
                    onClick={handleReset}
                    className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                    Reset
                </button>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-semibold mb-2">Upload Flight Screenshot:</h3>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="mb-4" />

            {preview && (
                <div className="mb-4">
                    <img src={preview} alt="Uploaded preview" className="max-h-48 rounded" />
                </div>
            )}

            <h3 className="font-semibold mb-2">Detected Dates:</h3>
            {loading && <p className="text-blue-500">Detecting dates…</p>}

            <div className="grid grid-cols-2 gap-2">
                {dates.map((d, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (!startDate) setStartDate(d);
                            else if (!endDate) setEndDate(d);
                            else setStartDate(d); // overwrite if both already set
                        }}
                        className={`border p-2 rounded ${
                            d === startDate
                                ? "bg-green-200"
                                : d === endDate
                                    ? "bg-yellow-200"
                                    : "hover:bg-gray-100"
                        }`}
                    >
                        {new Date(d).toDateString()}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <p>
                    Start Date: <span className="font-semibold">{startDate ?? "Not set"}</span>
                </p>
                <p>
                    End Date: <span className="font-semibold">{endDate ?? "Not set"}</span>
                </p>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleConfirm}
                    disabled={!startDate || !endDate}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
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
        </div>
    );
}

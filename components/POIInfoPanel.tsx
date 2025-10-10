"use client";
import React from "react";
import Draggable from "react-draggable";

interface POIInfoPanelProps {
    name: string;
    address?: string;
    rating?: number;
    photoUrl?: string;
    hours?: string[];
    onClose: () => void;
}

export default function POIInfoPanel({
                                         name,
                                         address,
                                         rating,
                                         photoUrl,
                                         hours,
                                         onClose,
                                     }: POIInfoPanelProps) {
    return (
        <Draggable handle=".drag-handle" defaultPosition={{ x: 100, y: 80 }}>
            <div className="fixed bg-white shadow-2xl rounded-2xl w-96 overflow-hidden cursor-move z-50">
                {/* Drag handle */}
                <div className="drag-handle flex justify-between items-center bg-gray-100 px-4 py-3 cursor-grab active:cursor-grabbing">
                    <h2 className="font-bold text-lg text-gray-800">{name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 text-xl font-semibold"
                    >
                        ✕
                    </button>
                </div>

                {/* Photo */}
                {photoUrl && (
                    <img src={photoUrl} alt={name} className="w-full h-56 object-cover" />
                )}

                {/* Details */}
                <div className="p-4 space-y-3 text-gray-700">
                    {address && (
                        <p className="flex items-center gap-2">
                            📍 <span>{address}</span>
                        </p>
                    )}
                    {rating && (
                        <p className="flex items-center gap-2">
                            ⭐ <span>{rating} / 5</span>
                        </p>
                    )}
                    {hours && hours.length > 0 && (
                        <div>
                            <p className="font-semibold text-gray-800">🕒 Hours:</p>
                            <ul className="text-sm text-gray-600 list-disc ml-5">
                                {hours.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </Draggable>
    );
}

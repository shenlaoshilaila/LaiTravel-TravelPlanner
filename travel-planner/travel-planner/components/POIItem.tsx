"use client";
import React from "react";
import { POI } from "./types";


export interface DayPOI {
    day: number;
    pois: POI[];
}


export interface DayPOI {
    day: number;
    pois: POI[];
}

interface POIItemProps {
    poi: POI;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}

export default function POIItem({
                                    poi,
                                    onMoveUp,
                                    onMoveDown,
                                    onRemove,
                                }: POIItemProps) {


    return (
        <li className="flex items-center justify-between border-b py-2 px-4 hover:bg-gray-100 rounded">
      <span className="font-medium flex items-center">
        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-blue-500 text-white rounded-full text-sm">
          {poi.sequence}
        </span>
          {poi.name}
      </span>
            <div className="space-x-2">
                <button onClick={onMoveUp} title="Move Up" className="text-blue-600 hover:underline">
                    ⬆️
                </button>
                <button onClick={onMoveDown} title="Move Down" className="text-blue-600 hover:underline">
                    ⬇️
                </button>
                <button onClick={onRemove} title="Delete" className="text-red-500 hover:underline">
                    🗑️
                </button>
            </div>
        </li>
    );
}

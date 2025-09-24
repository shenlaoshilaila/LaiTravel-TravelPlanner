import React from "react";
import POIItem from "./POIItem";
import { POI } from "./types"; // ✅ get POI from shared types

interface POIListProps {
    pois: POI[];
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemove: (index: number) => void;
}

export default function POIList({
                                    pois,
                                    onMoveUp,
                                    onMoveDown,
                                    onRemove,
                                }: POIListProps) {
    return (
        <ul className="space-y-2">
            {pois.map((poi, index) => (
                <POIItem
                    key={index}
                    poi={poi}
                    onMoveUp={() => onMoveUp(index)}
                    onMoveDown={() => onMoveDown(index)}
                    onRemove={() => onRemove(index)}
                />
            ))}
        </ul>
    );
}

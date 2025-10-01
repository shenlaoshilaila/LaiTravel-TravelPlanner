"use client";
import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

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
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                onCityChange(place.formatted_address);
            } else if (place.name) {
                onCityChange(place.name);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* City autocomplete input */}
            <div>
                <label className="block font-medium">Select City:</label>
                <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                >
                    <input
                        type="text"
                        defaultValue={city}
                        placeholder="Start typing a city..."
                        className="w-full border px-3 py-1 rounded"
                    />
                </Autocomplete>
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

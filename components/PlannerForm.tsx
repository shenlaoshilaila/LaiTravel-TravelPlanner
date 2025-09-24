"use client";
import React from "react";

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
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium"> Select City:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full border px-3 py-1 rounded"
        />
      </div>
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

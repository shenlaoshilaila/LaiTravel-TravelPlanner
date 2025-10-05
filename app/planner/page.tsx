"use client";

import React, { useState } from "react";
import PlannerForm from "@/components/PlannerForm";
import PlannerMap from "@/components/PlannerMap";
import { POI } from "@/components/types";

export default function PlannerPage() {
    // 🧠 State that connects everything
    const [city, setCity] = useState("Beijing, China");
    const [days, setDays] = useState(3);
    const [pois, setPois] = useState<POI[]>([]);

    return (
        <div className="flex h-[80vh] gap-4 p-4">
            {/* LEFT SIDE — inputs */}
            <div className="w-1/3 space-y-6">
                <h1 className="text-xl font-semibold mb-2">Plan Your Trip</h1>

                <PlannerForm
                    city={city}
                    days={days}
                    onCityChange={(newCity) => setCity(newCity)}
                    onDaysChange={(newDays) => setDays(newDays)}
                />

                {/* You could later add POI selectors here */}
            </div>

            {/* RIGHT SIDE — map */}
            <div className="flex-1 border rounded-lg overflow-hidden">
                <PlannerMap city={city} pois={pois} />
            </div>
        </div>
    );
}

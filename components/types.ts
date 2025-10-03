// components/types.ts

export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence: number;
    day: number;
    city?: string;
    date?: string; // ✅ optional support for date-based itineraries
}

export interface DayPOI {
    day: number;
    date: string; // ✅ optional per-day date (yyyy-mm-dd)
    city: string;
    pois: POI[];
}

// When saving, plan can be based on "days" OR a date range
export interface PlanData {
    days?: number; // ✅ optional (for simple day count itineraries)
    startDate?: string; // ✅ optional (yyyy-mm-dd)
    endDate?: string;   // ✅ optional (yyyy-mm-dd)
    pois: DayPOI[] | POI[];
}

export interface PlanSavedResponse {
    id: string;
    plan?: any; // backend shape fallback
}

export interface SavePlanButtonProps {
    planData: PlanData;
    onPlanSaved?: (saved: PlanSavedResponse) => void;
}

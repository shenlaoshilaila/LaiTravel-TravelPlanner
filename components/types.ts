// components/types.ts

// ✅ A single point of interest (POI)
export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence?: number;
    day?: number;
    city?: string;
    date?: string; // optional per-day date (yyyy-mm-dd)
    place_id?: string; // ✅ Google Places API unique ID (correct key name)
}

// ✅ A day's worth of POIs
export interface DayPOI {
    day: number;
    date?: string; // optional per-day date (yyyy-mm-dd)
    city?: string;
    pois: POI[];
}

// ✅ When saving, plan can be based on "days" OR a date range
export interface PlanData {
    days?: number;      // optional (for simple day count itineraries)
    startDate?: string; // optional (yyyy-mm-dd)
    endDate?: string;   // optional (yyyy-mm-dd)
    pois: DayPOI[] | POI[];
}

// ✅ Response returned from backend after saving
export interface PlanSavedResponse {
    id: string;
    plan?: any; // backend shape fallback
}

// ✅ Props for SavePlanButton component
export interface SavePlanButtonProps {
    planData: PlanData;
    onPlanSaved?: (saved: PlanSavedResponse) => void;
}

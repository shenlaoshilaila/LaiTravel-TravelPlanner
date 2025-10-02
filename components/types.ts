// components/types.ts

// ---------- POI (Place of Interest) ----------
export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence: number;   // order within the day
    day: number;        // which day this POI belongs to
    city?: string;      // ✅ optional city for this POI
}

export interface POIWithSequence extends POI {
    sequence: number;
}

// ---------- Day-level ----------
export interface DayPOI {
    day: number;
    city?: string;   // ✅ each day can have its own city
    pois: POI[];
}

// ---------- Plan Data ----------
export interface PlanData {
    days: number;
    city?: string;     // ✅ optional global city (legacy support)
    pois: DayPOI[] | POI[];  // ✅ can be grouped by day or flat POIs
}

// ---------- Saved Plan ----------
export interface SavedPlan {
    id: string | number;
    days: number;
    city?: string;       // ✅ backend may still return global city
    itinerary?: DayPOI[]; // ✅ richer shape if backend provides
    created_at?: string;
}

// ---------- Backend Response ----------
export interface PlanSavedResponse {
    success?: boolean;
    plan?: SavedPlan;
    message?: string;
    id?: string | number;  // some backends return id at top-level
}

// Minimal fallback if backend only returns ID
export type MinimalSaved =
    | { id?: string | number }
    | { plan?: { id?: string | number } };

// ---------- Save Button Props ----------
export interface SavePlanButtonProps {
    planData: PlanData;
    onPlanSaved?: (saved: PlanSavedResponse | MinimalSaved) => void;
}

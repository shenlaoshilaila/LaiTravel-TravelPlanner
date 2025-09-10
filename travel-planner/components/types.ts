// components/types.ts

export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence: number;
    day: number;
}

export interface POIWithSequence extends POI {
    sequence: number;
}

export interface DayPOI {
    day: number;
    pois: POI[];
}

export interface PlanData {
    city: string;
    days: number;
    // You pass POI[] from page.tsx (allPois)
    pois: POI[];
}

// ID can be UUID string or numeric depending on backend
export interface SavedPlan {
    id: string | number;
    city: string;
    days: number;
    // Keep if you use it elsewhere; backend may not return this
    itinerary?: DayPOI[];
    created_at?: string;
}

// More flexible response from backend
export interface PlanSavedResponse {
    success?: boolean;
    plan?: SavedPlan;
    message?: string;
    // Some backends return the id at top-level
    id?: string | number;
}

// Minimal shape we can synthesize client-side (e.g., from Location header)
export type MinimalSaved =
    | { id?: string | number }
    | { plan?: { id?: string | number } };

// Props for Save button
export interface SavePlanButtonProps {
    planData: PlanData;
    // Allow both the rich response and our minimal fallback
    onPlanSaved?: (saved: PlanSavedResponse | MinimalSaved) => void;
}

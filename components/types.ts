// components/types.ts

export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence: number;
    day: number;
    city?: string;
    date?: string; // ✅ NEW
}

export interface DayPOI {
    day: number;
    date: string; // ✅ NEW - actual calendar date
    city?: string;
    pois: POI[];
}

// When saving a plan
export interface PlanData {
    // Before: days: number;
    startDate?: string; // ✅ NEW
    endDate?: string;   // ✅ NEW
    pois: POI[];
}

// For backend response
export interface PlanSavedResponse {
    id: string;
    plan?: any;
}

export interface SavePlanButtonProps {
    planData: PlanData;
    onPlanSaved?: (res: PlanSavedResponse) => void;
}

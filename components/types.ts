// components/types.ts

// ✅ A single point of interest (POI)
export interface POI {
    name: string;
    lat: number;
    lng: number;
    sequence?: number;
    day?: number;
    city?: string;
    date?: string;        // optional per-day date (yyyy-mm-dd)
    place_id?: string;    // ✅ Google Places API unique ID (correct key name)
    address?: string;     // ✅ formatted address (for info window)
    rating?: number;      // ✅ optional Google rating (0–5)
    photoUrl?: string;    // ✅ first photo URL (from Places API)
    url?: string;         // ✅ direct link to Google Maps listing
}

// ✅ A day's worth of POIs
export interface DayPOI {
    day: number;
    date?: string;        // optional per-day date (yyyy-mm-dd)
    city?: string;
    pois: POI[];
}

// ✅ When saving, plan can be based on "days" OR a date range
export interface PlanData {
    days?: number;        // optional (for simple day count itineraries)
    startDate?: string;   // optional (yyyy-mm-dd)
    endDate?: string;     // optional (yyyy-mm-dd)
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

// ✅ Props for DayPOISection component
export interface DayPOISectionProps {
    day: number;
    date: string;
    city: string;
    initialPois: POI[];
    isActive: boolean;
    onSelectDay: (day: number) => void;
    onUpdatePois: (day: number, pois: POI[]) => void;
    onCityChange: (day: number, city: string) => void;
    backendUrl: string;
    onRemovePOIGlobally?: (poi: POI) => void;
}

// ✅ Props for AIChatPlannerBar component
export interface AIChatPlannerBarProps {
    onPlanGenerated: (data: DayPOI[]) => void;
}

// ✅ Distance information for POI routing
export interface DistanceInfo {
    drivingText?: string;
    walkingText?: string;
}

// ✅ User type for authentication
export interface User {
    id: string;
    name?: string;
}

// ✅ Props for PlannerMap component
export interface PlannerMapProps {
    city: string;
    pois: POI[];
    onCityResolved?: (resolvedCity: string) => void;
}

// ✅ Props for SearchPOI component
export interface SearchPOIProps {
    city: string;
    onPick: (poi: POI) => void;
    placeholder?: string;
}

// ✅ Props for FlightDateExtractor component
export interface FlightDateExtractorProps {
    onSelect: (startDate: string, endDate: string) => void;
    onReset: () => void;
}

// ✅ Props for AIChatBar component
export interface AIChatBarProps {
    city: string;
    days: number;
    selectedDay: number | null;
    dayPOIs: DayPOI[];
    embedMode?: boolean;
}
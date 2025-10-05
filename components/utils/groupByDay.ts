import { POI } from "@/components/types";

/**
 * Groups a list of POIs by their `day` property.
 * Returns a Map where the key is the day number and
 * the value is an array of POIs for that day.
 */
export function groupByDay(pois: POI[]): Map<number, POI[]> {
    const map = new Map<number, POI[]>();

    for (const poi of pois) {
        // ✅ Skip POIs without a valid day
        if (poi.day === undefined || poi.day === null) continue;

        // Initialize array for the day if needed
        if (!map.has(poi.day)) {
            map.set(poi.day, []);
        }

        // Push POI into the correct day group
        map.get(poi.day)!.push(poi);
    }

    return map;
}

/**
 * Convenience alias for backward compatibility.
 * (If some older files import groupPOIsByDay instead of groupByDay)
 */
export const groupPOIsByDay = groupByDay;

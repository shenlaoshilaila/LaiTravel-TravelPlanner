import { POI, DayPOI } from "@/components/types";

/**
 * Groups a flat list of POIs into an array of DayPOI objects.
 *
 * - Each POI must include a valid `day` number.
 * - POIs without a `day` are skipped.
 * - The resulting array is sorted by day.
 */
export function groupPOIsByDay(pois: POI[]): DayPOI[] {
    const grouped = new Map<number, POI[]>();

    // Group POIs by their day number
    for (const poi of pois) {
        if (poi.day == null) continue; // skip undefined/null
        if (!grouped.has(poi.day)) grouped.set(poi.day, []);
        grouped.get(poi.day)!.push(poi);
    }

    // Convert Map → array of DayPOI objects
    const dayList: DayPOI[] = Array.from(grouped.entries())
        .map(([day, pois]) => ({
            day,
            city: pois[0]?.city ?? "",
            date: pois[0]?.date ?? "",
            pois,
        }))
        .sort((a, b) => a.day - b.day); // optional: ensure ascending order

    return dayList;
}

/**
 * Legacy alias for backward compatibility.
 * You can safely remove this later if all imports use groupPOIsByDay.
 */
export const groupByDay = groupPOIsByDay;

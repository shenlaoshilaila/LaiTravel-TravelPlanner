import { POI, DayPOI } from "../types"; // adjust path if needed

export function groupPOIsByDay(pois: POI[]): DayPOI[] {
    const map = new Map<number, POI[]>();

    for (const poi of pois) {
        if (!map.has(poi.day)) {
            map.set(poi.day, []);
        }
        map.get(poi.day)!.push(poi);
    }

    const grouped: DayPOI[] = Array.from(map.entries())
        .sort(([a], [b]) => a - b)
        .map(([day, pois]) => ({ day, pois }));

    return grouped;
}

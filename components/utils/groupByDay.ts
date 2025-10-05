import { POI } from "@/components/types";

export function groupByDay(pois: POI[]) {
    const map = new Map<number, POI[]>();

    for (const poi of pois) {
        // ✅ Skip invalid / undefined day values
        if (poi.day === undefined) continue;

        if (!map.has(poi.day)) {
            map.set(poi.day, []);
        }
        map.get(poi.day)!.push(poi);
    }

    return map;
}

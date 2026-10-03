import { Difficulty } from "../models/TrailModel";
import { CatalogTrail } from "./trailCatalog";

type OsmElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const sacDifficulty: Record<string, Difficulty> = {
  hiking: "Easy",
  mountain_hiking: "Medium",
  demanding_mountain_hiking: "Hard",
  alpine_hiking: "Hard",
  demanding_alpine_hiking: "Extremely challenging",
  difficult_alpine_hiking: "Extremely challenging",
};

const regions = [
  "49.2,-123.5,49.5,-122.7",
  "49.6,-123.4,50.4,-122.6",
  "48.3,-124.2,48.8,-123.3",
  "49.4,-119.8,50.2,-119.2",
];

export const overpassQueries = regions.map(
  (box) => `
[out:json][timeout:15];
(
  way["highway"~"path|footway"]["name"]["sac_scale"](${box});
);
out center 20;
`.trim()
);

export function mapOsmElement(element: OsmElement): CatalogTrail | null {
  const tags = element.tags || {};
  const name = tags.name?.trim();
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (!name || name.length < 3 || latitude == null || longitude == null) return null;
  if (latitude < 48 || latitude > 60 || longitude < -140 || longitude > -114) return null;

  const scale = tags.sac_scale || "";
  const difficulty = sacDifficulty[scale] || "Medium";
  const place = [tags["addr:city"], tags["addr:province"] || "BC"].filter(Boolean).join(", ");

  return {
    name,
    location: place || "British Columbia",
    difficulty,
    elevation: tags.ele ? `${tags.ele} m` : "Not listed",
    length: tags.distance || "Not listed",
    routeType: "Trail",
    rating: null,
    description: scale
      ? `OpenStreetMap trail marked ${scale.replace(/_/g, " ")}. Confirm the route before you go.`
      : "OpenStreetMap trail. Confirm the route before you go.",
    latitude,
    longitude,
  };
}

async function fetchRegion(
  query: string,
  fetchImpl: typeof fetch
): Promise<OsmElement[]> {
  const response = await fetchImpl("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
      "User-Agent": "BCHikingBlogTeamUp/1.0 (trail catalog import)",
    },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) {
    throw new Error(`OpenStreetMap import failed (${response.status})`);
  }
  const body = (await response.json()) as { elements?: OsmElement[] };
  return body.elements || [];
}

export async function fetchOsmTrails(fetchImpl: typeof fetch = fetch): Promise<CatalogTrail[]> {
  const seen = new Set<string>();
  const trails: CatalogTrail[] = [];
  const failures: string[] = [];

  for (const query of overpassQueries) {
    if (trails.length >= 40) break;
    try {
      const elements = await fetchRegion(query, fetchImpl);
      for (const element of elements) {
        const trail = mapOsmElement(element);
        if (!trail) continue;
        const key = trail.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        trails.push(trail);
        if (trails.length >= 40) break;
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "unknown error");
    }
  }

  if (trails.length === 0 && failures.length > 0) {
    throw new Error(failures[0]);
  }
  return trails;
}

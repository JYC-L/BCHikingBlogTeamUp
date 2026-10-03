import Trail from "../models/TrailModel";
import { CatalogTrail } from "./trailCatalog";

export async function upsertTrails(trails: CatalogTrail[]): Promise<number> {
  if (trails.length === 0) return 0;
  const result = await Trail.bulkWrite(
    trails.map((trail) => ({
      updateOne: {
        filter: { name: trail.name },
        update: {
          $setOnInsert: {
            ...trail,
            photos: [],
            geo: {
              type: "Point",
              coordinates: [trail.longitude, trail.latitude],
            },
          },
        },
        upsert: true,
      },
    }))
  );
  return result.upsertedCount;
}

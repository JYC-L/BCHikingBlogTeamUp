import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fetchOsmTrails } from "../data/osmTrails";
import { trailCatalog } from "../data/trailCatalog";
import { upsertTrails } from "../data/upsertTrails";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function importTrails(): Promise<void> {
  const uri = process.env.DB_CONNECTION_STR;
  if (!uri) {
    throw new Error("DB_CONNECTION_STR is missing");
  }
  await mongoose.connect(uri);
  const catalogAdded = await upsertTrails(trailCatalog);
  let osmAdded = 0;
  try {
    const osmTrails = await fetchOsmTrails();
    const catalogNames = new Set(trailCatalog.map((trail) => trail.name.toLowerCase()));
    const extra = osmTrails.filter((trail) => !catalogNames.has(trail.name.toLowerCase()));
    osmAdded = await upsertTrails(extra);
    console.log(`OpenStreetMap returned ${osmTrails.length} trails, added ${osmAdded}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("OpenStreetMap import skipped:", message);
  }
  console.log(`Catalog trails added: ${catalogAdded}`);
  await mongoose.disconnect();
}

importTrails().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(message);
  process.exit(1);
});

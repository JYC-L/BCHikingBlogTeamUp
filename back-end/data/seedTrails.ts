import { trailCatalog } from "./trailCatalog";
import { upsertTrails } from "./upsertTrails";

async function seedTrails(): Promise<void> {
  const added = await upsertTrails(trailCatalog);
  if (added > 0) {
    console.log(`Added ${added} trail profiles`);
  }
}

export default seedTrails;

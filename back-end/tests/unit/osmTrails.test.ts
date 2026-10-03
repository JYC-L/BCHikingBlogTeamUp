import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { difficulties } from "../../models/TrailModel";
import { trailCatalog } from "../../data/trailCatalog";
import { fetchOsmTrails, mapOsmElement } from "../../data/osmTrails";

describe("trail catalog", () => {
  it("uses unique names and coordinates inside British Columbia", () => {
    const names = new Set(trailCatalog.map((trail) => trail.name));
    assert.equal(names.size, trailCatalog.length);
    assert.ok(trailCatalog.length >= 40);
    for (const trail of trailCatalog) {
      assert.ok(difficulties.includes(trail.difficulty));
      assert.ok(trail.latitude >= 48 && trail.latitude <= 60);
      assert.ok(trail.longitude <= -114 && trail.longitude >= -140);
    }
  });
});

describe("mapOsmElement", () => {
  it("maps a named path to a stored trail profile", () => {
    const trail = mapOsmElement({
      center: { lat: 49.7, lon: -123.1 },
      tags: { name: "Example Ridge", sac_scale: "mountain_hiking", ele: "800" },
    });
    assert.ok(trail);
    assert.equal(trail?.name, "Example Ridge");
    assert.equal(trail?.difficulty, "Medium");
    assert.equal(trail?.elevation, "800 m");
    assert.match(trail?.description || "", /OpenStreetMap/);
  });

  it("skips unnamed or out-of-range features", () => {
    assert.equal(mapOsmElement({ center: { lat: 49.7, lon: -123.1 }, tags: {} }), null);
    assert.equal(
      mapOsmElement({
        center: { lat: 40, lon: -123 },
        tags: { name: "Too Far", sac_scale: "hiking" },
      }),
      null
    );
  });
});

describe("fetchOsmTrails", () => {
  it("keeps unique mapped trails from an Overpass response", async () => {
    const fetchImpl = async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers["User-Agent"], "BCHikingBlogTeamUp/1.0 (trail catalog import)");
      return {
        ok: true,
        json: async () => ({
          elements: [
            {
              center: { lat: 49.3, lon: -123.1 },
              tags: { name: "First Path", sac_scale: "hiking" },
            },
            {
              center: { lat: 49.4, lon: -123.2 },
              tags: { name: "First Path", sac_scale: "hiking" },
            },
            {
              center: { lat: 49.5, lon: -123.0 },
              tags: { name: "Second Path", sac_scale: "alpine_hiking" },
            },
          ],
        }),
      } as Response;
    };

    const trails = await fetchOsmTrails(fetchImpl as typeof fetch);
    assert.deepEqual(
      trails.map((trail) => trail.name),
      ["First Path", "Second Path"]
    );
    assert.equal(trails[1].difficulty, "Hard");
  });
});

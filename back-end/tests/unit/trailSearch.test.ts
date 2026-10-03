import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { trailSearchFilter } from "../../data/trailSearch";

describe("trailSearchFilter", () => {
  it("returns every trail when the query is blank", () => {
    assert.deepEqual(trailSearchFilter("   "), {});
  });

  it("searches name, place, difficulty, and description", () => {
    const filter = trailSearchFilter("squamish") as {
      $or: { name: RegExp; location: RegExp; difficulty: RegExp; description: RegExp }[];
    };
    assert.equal(filter.$or.length, 4);
    assert.equal(filter.$or[0].name.test("Sea to Sky, Squamish"), true);
    assert.equal(filter.$or[1].location.test("squamish"), true);
  });

  it("treats search punctuation as plain text", () => {
    const filter = trailSearchFilter("c++") as { $or: { name: RegExp }[] };
    assert.equal(filter.$or[0].name.test("c++ ridge"), true);
    assert.equal(filter.$or[0].name.test("cxx ridge"), false);
  });
});

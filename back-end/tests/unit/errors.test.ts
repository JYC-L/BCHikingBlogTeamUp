import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorMessage, isDuplicateKey } from "../../types/errors";

describe("error helpers", () => {
  it("reads an Error message", () => {
    assert.equal(errorMessage(new Error("missing trail")), "missing trail");
  });

  it("uses a fallback for unknown failures", () => {
    assert.equal(errorMessage("nope"), "Unexpected error");
  });

  it("recognizes a Mongo duplicate key", () => {
    assert.equal(isDuplicateKey({ code: 11000 }), true);
    assert.equal(isDuplicateKey({ code: 500 }), false);
    assert.equal(isDuplicateKey(null), false);
  });
});

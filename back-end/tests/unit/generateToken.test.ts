import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import jwt from "jsonwebtoken";
import generateToken from "../../config/generateToken";

describe("generateToken", () => {
  const previous = process.env.JWT_SECRET;

  afterEach(() => {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  });

  it("signs the user id", () => {
    process.env.JWT_SECRET = "unit-secret";
    const token = generateToken("abc123");
    const decoded = jwt.verify(token, "unit-secret") as { id: string };
    assert.equal(decoded.id, "abc123");
  });

  it("refuses to sign when the secret is missing", () => {
    delete process.env.JWT_SECRET;
    assert.throws(() => generateToken("abc123"), /JWT_SECRET is missing/);
  });
});

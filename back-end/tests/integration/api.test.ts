import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { trailCatalog } from "../../data/trailCatalog";
import seedTrails from "../../data/seedTrails";
import Trail from "../../models/TrailModel";
import { createApp } from "../../services/app";

process.env.JWT_SECRET = "integration-secret";

const app = createApp();
let mongo: MongoMemoryServer;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe("accounts and journals", () => {
  let token = "";
  let trailId = "";
  let journalId = "";

  it("rejects a short password", async () => {
    const response = await request(app).post("/api/users/register").send({
      username: "ada",
      email: "ada@example.com",
      password: "short",
    });
    assert.equal(response.status, 400);
  });

  it("registers and logs in without returning the password", async () => {
    const registered = await request(app).post("/api/users/register").send({
      username: "ada",
      email: "ada@example.com",
      password: "secret1",
    });
    assert.equal(registered.status, 201);
    assert.equal(registered.body.password, undefined);
    assert.equal(typeof registered.body.token, "string");

    const duplicate = await request(app).post("/api/users/register").send({
      username: "ada",
      email: "ada@example.com",
      password: "secret1",
    });
    assert.equal(duplicate.status, 409);

    const badLogin = await request(app)
      .post("/api/users/login")
      .send({ email: "ada@example.com", password: "wrongpass" });
    assert.equal(badLogin.status, 401);

    const login = await request(app)
      .post("/api/users/login")
      .send({ email: "ada@example.com", password: "secret1" });
    assert.equal(login.status, 200);
    token = login.body.token;

    const me = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.username, "ada");
    assert.equal(me.body.password, undefined);
  });

  it("stores the catalog once and searches it", async () => {
    const first = await seedTrails();
    const second = await seedTrails();
    assert.equal(first, undefined);
    assert.equal(second, undefined);
    assert.equal(await Trail.countDocuments(), trailCatalog.length);

    const grouse = await request(app).get("/api/trails").query({ q: "grouse" });
    assert.equal(grouse.status, 200);
    assert.equal(grouse.body.length, 1);
    assert.equal(grouse.body[0].name, "Grouse Grind");
    trailId = grouse.body[0]._id;

    const squamish = await request(app).get("/api/trails").query({ q: "squamish" });
    assert.ok(squamish.body.length > 1);
    assert.ok(squamish.body.every((trail: { location: string; name: string; description: string }) =>
      /squamish/i.test(`${trail.location} ${trail.name} ${trail.description}`)
    ));

    const missing = await request(app).get("/api/trails/507f1f77bcf86cd799439011");
    assert.equal(missing.status, 404);

    const profile = await request(app).get(`/api/trails/${trailId}`);
    assert.equal(profile.status, 200);
    assert.equal(profile.body.location, "North Vancouver, BC");
  });

  it("posts a journal onto a trail and lists it on the feed", async () => {
    const denied = await request(app).post("/api/blogs").send({
      title: "Morning",
      trail: trailId,
      content: "Cold start",
    });
    assert.equal(denied.status, 401);

    const created = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Stairs in the trees",
        trail: trailId,
        content: "Roots and stairs.",
        tags: "forest, stairs",
        difficulty: "Hard",
        distanceKm: 2.9,
      });
    assert.equal(created.status, 201);
    assert.equal(created.body.user.username, "ada");
    assert.equal(created.body.trail.name, "Grouse Grind");
    assert.deepEqual(created.body.tags, ["forest", "stairs"]);
    journalId = created.body._id;

    const feed = await request(app).get("/api/blogs");
    assert.equal(feed.status, 200);
    assert.equal(feed.body[0].title, "Stairs in the trees");
    assert.equal(feed.body[0].trail.name, "Grouse Grind");

    const onTrail = await request(app).get(`/api/blogs/trail/${trailId}`);
    assert.equal(onTrail.body.length, 1);

    const other = await request(app).post("/api/users/register").send({
      username: "beau",
      email: "beau@example.com",
      password: "secret1",
    });
    const blocked = await request(app)
      .put(`/api/blogs/${journalId}`)
      .set("Authorization", `Bearer ${other.body.token}`)
      .send({ title: "Changed" });
    assert.equal(blocked.status, 403);
  });
});

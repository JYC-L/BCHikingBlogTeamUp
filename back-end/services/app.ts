import cors from "cors";
import express from "express";
import blogRoute from "../routes/router.blog";
import connectionRoute from "../routes/router.connection";
import teamUpRoute from "../routes/router.teamup";
import trailRoute from "../routes/router.trail";
import uploadRoute from "../routes/router.upload";
import userRoute from "../routes/router.user";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/", (_req, res) => {
    res.send("BC Hiking Blog API");
  });
  app.use("/api/trails", trailRoute);
  app.use("/api/blogs", blogRoute);
  app.use("/api/teamups", teamUpRoute);
  app.use("/api/connections", connectionRoute);
  app.use("/api/users", userRoute);
  app.use("/api/upload", uploadRoute);
  return app;
}

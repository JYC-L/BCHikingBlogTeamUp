import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import seedTrails from "../data/seedTrails";
import blogRoute from "../routes/router.blog";
import trailRoute from "../routes/router.trail";
import uploadRoute from "../routes/router.upload";
import userRoute from "../routes/router.user";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("BC Hiking Blog API");
});

app.use("/api/trails", trailRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/users", userRoute);
app.use("/api/upload", uploadRoute);

const uri = process.env.DB_CONNECTION_STR;
if (!uri) {
  console.error("database connection fails: DB_CONNECTION_STR is missing");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(async () => {
    await seedTrails();
    app.listen(PORT, () => {
      console.log(`server is running at port ${PORT}`);
    });
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("database connection fails:", message);
    process.exit(1);
  });

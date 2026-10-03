import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import seedTrails from "../data/seedTrails";
import { createApp } from "./app";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = createApp();
const PORT = process.env.PORT || 5055;

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

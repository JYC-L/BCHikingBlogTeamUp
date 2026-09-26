const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/../.env" });

const blogRoute = require("../routes/router.blog");
const trailRoute = require("../routes/router.trail");
const userRoute = require("../routes/router.user");
const uploadRoute = require("../routes/router.upload");
const seedTrails = require("../data/seedTrails");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("BC Hiking Blog API");
});

app.use("/api/trails", trailRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/users", userRoute);
app.use("/api/upload", uploadRoute);

mongoose
  .connect(process.env.DB_CONNECTION_STR)
  .then(async () => {
    await seedTrails();
    app.listen(PORT, () => {
      console.log(`server is running at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("database connection fails:", error.message);
    process.exit(1);
  });

const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: { type: [String], default: [] },
    trail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trail",
      required: true,
    },
    content: { type: String, required: true },
    conditions: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Extremely challenging", ""],
      default: "",
    },
    distanceKm: { type: Number },
    elevationM: { type: Number },
    durationMinutes: { type: Number },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);

import mongoose, { Types } from "mongoose";
import { Difficulty, difficulties } from "./TrailModel";

export interface IBlog {
  title: string;
  user: Types.ObjectId;
  images: string[];
  trail: Types.ObjectId;
  content: string;
  conditions: string;
  difficulty: Difficulty | "";
  distanceKm?: number;
  elevationM?: number;
  durationMinutes?: number;
  tags: string[];
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
      enum: [...difficulties, ""],
      default: "",
    },
    distanceKm: { type: Number },
    elevationM: { type: Number },
    durationMinutes: { type: Number },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;

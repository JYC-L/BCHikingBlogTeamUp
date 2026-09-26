import mongoose from "mongoose";

export const difficulties = [
  "Easy",
  "Medium",
  "Hard",
  "Extremely challenging",
] as const;

export type Difficulty = (typeof difficulties)[number];

export interface ITrail {
  name: string;
  location: string;
  difficulty: Difficulty;
  photos: string[];
  elevation: string;
  length: string;
  routeType: string;
  rating: number | null;
  description: string;
  latitude: number;
  longitude: number;
  geo: {
    type: "Point";
    coordinates: [number, number];
  };
}

const trailSchema = new mongoose.Schema<ITrail>(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    difficulty: {
      type: String,
      enum: difficulties,
      required: true,
    },
    photos: { type: [String], default: [] },
    elevation: { type: String, required: true },
    length: { type: String, required: true },
    routeType: { type: String, required: true },
    rating: { type: Number, default: null },
    description: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    geo: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true }
);

trailSchema.index({ geo: "2dsphere" });

const Trail = mongoose.model<ITrail>("Trail", trailSchema);

export default Trail;

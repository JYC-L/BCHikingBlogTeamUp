import mongoose, { Types } from "mongoose";

export interface ITeamUp {
  user: Types.ObjectId;
  trail: Types.ObjectId;
  date: Date;
  groupSize: number;
  note: string;
  details: string;
}

const teamUpSchema = new mongoose.Schema<ITeamUp>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trail: { type: mongoose.Schema.Types.ObjectId, ref: "Trail", required: true },
    date: { type: Date, required: true },
    groupSize: { type: Number, required: true, min: 2 },
    note: { type: String, required: true, trim: true },
    details: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const TeamUp = mongoose.model<ITeamUp>("TeamUp", teamUpSchema);

export default TeamUp;

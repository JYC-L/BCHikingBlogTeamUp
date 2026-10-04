import mongoose, { Types } from "mongoose";

export const connectionStatuses = ["pending", "accepted", "declined"] as const;
export type ConnectionStatus = (typeof connectionStatuses)[number];

export interface IConnection {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  teamUp?: Types.ObjectId;
  status: ConnectionStatus;
}

const connectionSchema = new mongoose.Schema<IConnection>(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamUp: { type: mongoose.Schema.Types.ObjectId, ref: "TeamUp" },
    status: { type: String, enum: connectionStatuses, default: "pending" },
  },
  { timestamps: true }
);

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Connection = mongoose.model<IConnection>("Connection", connectionSchema);

export default Connection;

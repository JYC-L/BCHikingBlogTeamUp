import { Request, Response } from "express";
import Connection from "../models/ConnectionModel";
import User from "../models/UserModel";
import { errorMessage, isDuplicateKey } from "../types/errors";

async function ensureStatus<T extends { status?: string; save: () => Promise<unknown> }>(
  connection: T | null
): Promise<T | null> {
  if (connection && !connection.status) {
    connection.status = "pending";
    await connection.save();
  }
  return connection;
}

const people = [
  { path: "requester", select: "username pic" },
  { path: "recipient", select: "username pic" },
];

export const createConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const recipientId = String(req.body.userId || "");
    if (!recipientId) {
      res.status(400).json({ message: "Choose a hiker to connect with." });
      return;
    }
    if (String(req.user._id) === recipientId) {
      res.status(400).json({ message: "You cannot connect with yourself." });
      return;
    }
    const recipient = await User.findById(recipientId).select("username pic");
    if (!recipient) {
      res.status(404).json({ message: "That hiker cannot be found." });
      return;
    }
    const existing = await Connection.findOne({
      requester: req.user._id,
      recipient: recipientId,
    });
    if (existing) {
      if (!existing.status || existing.status === "declined") {
        existing.status = "pending";
        await existing.save();
      }
      const populated = await existing.populate(people);
      res.status(200).json(populated);
      return;
    }
    const connection = await Connection.create({
      requester: req.user._id,
      recipient: recipientId,
      status: "pending",
      ...(req.body.teamUpId ? { teamUp: req.body.teamUpId } : {}),
    });
    const populated = await connection.populate(people);
    res.status(201).json(populated);
  } catch (error) {
    if (isDuplicateKey(error)) {
      res.status(200).json({ message: "Request already sent." });
      return;
    }
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const listMyConnections = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const [incoming, outgoing] = await Promise.all([
      Connection.find({ recipient: req.user._id }).sort({ createdAt: -1 }).populate(people),
      Connection.find({ requester: req.user._id }).sort({ createdAt: -1 }).populate(people),
    ]);
    await Promise.all([...incoming, ...outgoing].map((item) => ensureStatus(item)));
    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const connectionWith = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const otherId = req.params.userId;
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: otherId },
        { requester: otherId, recipient: req.user._id },
      ],
    }).populate(people);
    await ensureStatus(connection);
    res.status(200).json({ status: connection?.status || "none", connection });
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

const decide = (status: "accepted" | "declined") => async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      res.status(404).json({ message: "That request cannot be found." });
      return;
    }
    if (String(connection.recipient) !== String(req.user._id)) {
      res.status(403).json({ message: "Only the recipient can answer this request." });
      return;
    }
    connection.status = status;
    await connection.save();
    const populated = await connection.populate(people);
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const acceptConnection = decide("accepted");
export const declineConnection = decide("declined");

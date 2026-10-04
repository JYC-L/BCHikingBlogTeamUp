import { Request, Response } from "express";
import TeamUp from "../models/TeamUpModel";
import Trail from "../models/TrailModel";
import { errorMessage } from "../types/errors";

const populate = [
  { path: "user", select: "username pic" },
  { path: "trail", select: "name location difficulty" },
];

type TeamUpBody = {
  trail?: string;
  date?: string;
  groupSize?: number | string;
  note?: string;
  details?: string;
};

export const getAllTeamUps = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await TeamUp.find().sort({ createdAt: -1 }).populate(populate);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getTeamUpsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await TeamUp.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate(populate);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const createTeamUp = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const body = req.body as TeamUpBody;
    const note = (body.note || "").trim();
    const groupSize = Number(body.groupSize);
    const day = String(body.date || "").slice(0, 10);
    const when = /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T12:00:00`) : null;
    if (!body.trail || !note || !when || Number.isNaN(when.getTime()) || !Number.isInteger(groupSize) || groupSize < 2) {
      res.status(400).json({
        message: "Trail, date, a group of at least 2, and a short note are required.",
      });
      return;
    }
    const trail = await Trail.findById(body.trail);
    if (!trail) {
      res.status(404).json({ message: "That trail does not exist." });
      return;
    }
    const post = await TeamUp.create({
      user: req.user._id,
      trail: body.trail,
      date: when,
      groupSize,
      note,
      details: (body.details || "").trim(),
    });
    const populated = await TeamUp.findById(post._id).populate(populate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

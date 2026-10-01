import { Request, Response } from "express";
import Trail, { ITrail } from "../models/TrailModel";
import { errorMessage, isDuplicateKey } from "../types/errors";

type TrailBody = Partial<ITrail>;

export const createTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as TrailBody;
    const trail = await Trail.create({
      ...body,
      geo: {
        type: "Point",
        coordinates: [Number(body.longitude), Number(body.latitude)],
      },
    });
    res.status(201).json(trail);
  } catch (error) {
    if (isDuplicateKey(error)) {
      res.status(409).json({ message: "A trail with that name already exists." });
      return;
    }
    res.status(500).json({ message: errorMessage(error) });
  }
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllTrails = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = String(req.query.q || "").trim();
    const pattern = q ? new RegExp(escapeRegex(q), "i") : null;
    const trails = await Trail.find(
      pattern
        ? {
            $or: [
              { name: pattern },
              { location: pattern },
              { difficulty: pattern },
              { description: pattern },
            ],
          }
        : {}
    ).sort({ name: 1 });
    res.status(200).json(trails);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    const trail = await Trail.findById(req.params.id);
    if (!trail) {
      res.status(404).json({ message: "The trail cannot be found." });
      return;
    }
    res.status(200).json(trail);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const updateTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    const update = { ...(req.body as TrailBody) };
    if (update.latitude != null && update.longitude != null) {
      update.geo = {
        type: "Point",
        coordinates: [Number(update.longitude), Number(update.latitude)],
      };
    }
    const trail = await Trail.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!trail) {
      res.status(404).json({ message: "The trail cannot be found." });
      return;
    }
    res.status(200).json(trail);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const deleteTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    const trail = await Trail.findByIdAndDelete(req.params.id);
    if (!trail) {
      res.status(404).json({ message: "The trail cannot be found." });
      return;
    }
    res.status(200).json({ message: "Trail successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

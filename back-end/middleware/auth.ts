import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization || "";
  const secret = process.env.JWT_SECRET;
  if (!header.startsWith("Bearer ") || !secret) {
    res.status(401).json({ message: "Please log in first." });
    return;
  }

  try {
    const decoded = jwt.verify(header.slice(7), secret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Please log in first." });
  }
};

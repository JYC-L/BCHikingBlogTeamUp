import { Request, Response } from "express";
import generateToken from "../config/generateToken";
import User, { UserDocument } from "../models/UserModel";
import { errorMessage } from "../types/errors";

type RegisterBody = {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  pic?: string;
};

const publicUser = (user: UserDocument) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  pic: user.pic,
  token: generateToken(user._id),
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as RegisterBody;
    const username = (body.username || body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!username || !email || !password) {
      res.status(400).json({ message: "Username, email, and password are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters." });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ message: "That email or username is already registered." });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      ...(body.pic ? { pic: body.pic } : {}),
    });
    res.status(201).json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }
    res.status(200).json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json(req.user);
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "The user cannot be found." });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { password?: string };
    if (body.password) {
      res.status(400).json({ message: "Password changes are not available yet." });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      res.status(404).json({ message: "The user cannot be found." });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "The user cannot be found." });
      return;
    }
    res.status(200).json({ message: "User successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

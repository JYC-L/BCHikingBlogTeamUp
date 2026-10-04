import { Router } from "express";
import { createTeamUp, getAllTeamUps, getTeamUpsByUser } from "../controllers/controller.teamup";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getAllTeamUps);
router.get("/user/:userId", getTeamUpsByUser);
router.post("/", protect, createTeamUp);

export default router;

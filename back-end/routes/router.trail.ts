import { Router } from "express";
import {
  createTrail,
  deleteTrail,
  getAllTrails,
  getTrail,
  updateTrail,
} from "../controllers/controller.trail";

const router = Router();

router.get("/", getAllTrails);
router.get("/:id", getTrail);
router.post("/", createTrail);
router.put("/:id", updateTrail);
router.delete("/:id", deleteTrail);

export default router;

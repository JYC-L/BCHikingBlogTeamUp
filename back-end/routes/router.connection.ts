import { Router } from "express";
import {
  acceptConnection,
  connectionWith,
  createConnection,
  declineConnection,
  listMyConnections,
} from "../controllers/controller.connection";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createConnection);
router.get("/mine", protect, listMyConnections);
router.get("/with/:userId", protect, connectionWith);
router.post("/:id/accept", protect, acceptConnection);
router.post("/:id/decline", protect, declineConnection);

export default router;

import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/controller.user";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateJWT, getMe);
router.put("/profile", authenticateJWT, updateProfile);

export default router;

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getSession,
  refreshToken,
  logoutUser,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import { authenticateJWT, optionalAuthenticateJWT } from "../middleware/auth.js";

const router = Router();

// Public authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

// Protected session & profile management routes
router.get("/me", authenticateJWT, getMe);
router.get("/session", authenticateJWT, getSession);
router.post("/refresh", authenticateJWT, refreshToken);
router.post("/logout", optionalAuthenticateJWT, logoutUser);
router.put("/profile", authenticateJWT, updateProfile);

export default router;

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import { User } from "../../src/types.js";

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      res.status(400).json({ success: false, message: "Please provide all required fields." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const db = getDb();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(400).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      res.status(400).json({ success: false, message: "Username is already taken. Please choose another." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newUser: User = {
      id: "user_" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      bio: "Software engineer & passionate tech writer.",
      joinedDate: formattedDate,
      password: hashedPassword,
    };

    db.users.push(newUser);

    const token = generateToken(newUser.id, newUser.email);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Register Controller Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ success: false, message: "Please provide email/username and password." });
      return;
    }

    const cleanInput = emailOrUsername.trim().toLowerCase();
    const db = getDb();
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.username.toLowerCase() === cleanInput
    );

    if (!user) {
      res.status(401).json({ success: false, message: "No account found with this email or username." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid password. Please try again." });
      return;
    }

    const token = generateToken(user.id, user.email);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login Controller Error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// GET /api/auth/me (Protected)
export const getMe = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, user: userWithoutPassword });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ success: false, message: "Email and new password are required." });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    res.status(404).json({ success: false, message: "No account found with that email address." });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ success: true, message: "Password updated successfully. You can now log in." });
};

// PUT /api/auth/profile (Protected)
export const updateProfile = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  const { name, bio, avatar } = req.body;
  const db = getDb();
  const userIndex = db.users.findIndex((u) => u.id === req.user!.id);
  if (userIndex === -1) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (name) db.users[userIndex].name = name.trim();
  if (bio !== undefined) db.users[userIndex].bio = bio.trim();
  if (avatar) db.users[userIndex].avatar = avatar.trim();

  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  res.json({ success: true, message: "Profile updated successfully.", user: userWithoutPassword });
};

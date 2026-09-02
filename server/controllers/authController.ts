import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import { User } from "../../src/types.js";
import { UserModel } from "../models/User.js";
import { isMongoDBConnected } from "../config/db.js";

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, password } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Please provide your full name." });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: "Please provide a valid email address." });
      return;
    }
    if (!username || !username.trim()) {
      res.status(400).json({ success: false, message: "Please choose a username." });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Check if email or username already exists in MongoDB
    if (isMongoDBConnected()) {
      const existingEmail = await UserModel.findOne({ email: cleanEmail });
      if (existingEmail) {
        res.status(400).json({ success: false, message: "An account with this email already exists in MongoDB." });
        return;
      }

      const existingUsername = await UserModel.findOne({ username: cleanUsername });
      if (existingUsername) {
        res.status(400).json({ success: false, message: "Username is already taken. Please choose another." });
        return;
      }
    }

    // Also check in-memory store
    const memDb = getDb();
    if (memDb.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(400).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = "user_" + Date.now();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;

    const newUserObj: User = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      avatar: avatarUrl,
      bio: "Software developer & passionate tech writer.",
      joinedDate: formattedDate,
      password: hashedPassword,
    };

    // Save to MongoDB if connected
    if (isMongoDBConnected()) {
      await UserModel.create({
        id: userId,
        name: newUserObj.name,
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        avatar: avatarUrl,
        bio: newUserObj.bio,
        joinedDate: formattedDate,
      });
    }

    // Keep in-memory store synchronized
    memDb.users.push(newUserObj);

    const token = generateToken(newUserObj.id, newUserObj.email);
    const { password: _, ...userWithoutPassword } = newUserObj;

    res.status(201).json({
      success: true,
      message: "Account registered successfully in database.",
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error("Register Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration.",
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ success: false, message: "Please provide your email/username and password." });
      return;
    }

    const cleanInput = emailOrUsername.trim().toLowerCase();
    let foundUser: (User & { password?: string }) | null = null;

    // Check MongoDB first
    if (isMongoDBConnected()) {
      const dbUser = await UserModel.findOne({
        $or: [{ email: cleanInput }, { username: cleanInput }],
      }).lean();

      if (dbUser) {
        foundUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar,
          bio: dbUser.bio,
          joinedDate: dbUser.joinedDate,
          password: dbUser.password,
        };
      }
    }

    // Check in-memory store
    if (!foundUser) {
      const memUser = getDb().users.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.username.toLowerCase() === cleanInput
      );
      if (memUser) {
        foundUser = memUser;
      }
    }

    if (!foundUser) {
      res.status(401).json({
        success: false,
        message: "No account found with this email or username.",
      });
      return;
    }

    // Secure password comparison
    const isMatch = await bcrypt.compare(password, foundUser.password || "");
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid password. Please verify and try again.",
      });
      return;
    }

    const token = generateToken(foundUser.id, foundUser.email);
    const { password: _, ...userWithoutPassword } = foundUser;

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error("Login Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login.",
    });
  }
};

// GET /api/auth/me (Protected)
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, user: userWithoutPassword });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: "Email and new password are required." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updated = false;

    if (isMongoDBConnected()) {
      const user = await UserModel.findOne({ email: cleanEmail });
      if (user) {
        user.password = hashedPassword;
        await user.save();
        updated = true;
      }
    }

    const memDb = getDb();
    const memIndex = memDb.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (memIndex !== -1) {
      memDb.users[memIndex].password = hashedPassword;
      updated = true;
    }

    if (!updated) {
      res.status(404).json({ success: false, message: "No account found with that email address." });
      return;
    }

    res.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to reset password." });
  }
};

// PUT /api/auth/profile (Protected)
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { name, bio, avatar } = req.body;

    if (isMongoDBConnected()) {
      await UserModel.findOneAndUpdate(
        { id: req.user.id },
        {
          ...(name && { name: name.trim() }),
          ...(bio !== undefined && { bio: bio.trim() }),
          ...(avatar && { avatar: avatar.trim() }),
        }
      );
    }

    const memDb = getDb();
    const userIndex = memDb.users.findIndex((u) => u.id === req.user!.id);
    if (userIndex !== -1) {
      if (name) memDb.users[userIndex].name = name.trim();
      if (bio !== undefined) memDb.users[userIndex].bio = bio.trim();
      if (avatar) memDb.users[userIndex].avatar = avatar.trim();
    }

    const updatedUser = {
      ...req.user,
      ...(name && { name: name.trim() }),
      ...(bio !== undefined && { bio: bio.trim() }),
      ...(avatar && { avatar: avatar.trim() }),
    };

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
  }
};

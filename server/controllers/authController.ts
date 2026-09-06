import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";
import {
  generateToken,
  generateSessionDetails,
  TOKEN_EXPIRY_SECONDS,
  AuthRequest,
} from "../middleware/auth.js";
import { User } from "../../src/types.js";
import { UserModel } from "../models/User.js";
import { BlogModel } from "../models/Blog.js";
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

    const session = generateSessionDetails(newUserObj.id, newUserObj.email, newUserObj.username);
    const { password: _, ...userWithoutPassword } = newUserObj;

    res.status(201).json({
      success: true,
      message: "Account registered successfully in database.",
      user: userWithoutPassword,
      token: session.token,
      session: {
        algorithm: "HS256",
        expiresAt: session.expiresAt,
        expiresInSeconds: session.expiresInSeconds,
        issuedAt: session.issuedAt,
      },
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
    const emailOrUsername = req.body.emailOrUsername || req.body.email || req.body.username;
    const { password } = req.body;

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

    const session = generateSessionDetails(foundUser.id, foundUser.email, foundUser.username);
    const { password: _, ...userWithoutPassword } = foundUser;

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: userWithoutPassword,
      token: session.token,
      session: {
        algorithm: "HS256",
        expiresAt: session.expiresAt,
        expiresInSeconds: session.expiresInSeconds,
        issuedAt: session.issuedAt,
      },
    });
  } catch (error: any) {
    console.error("Login Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login.",
    });
  }
};

// GET /api/auth/me (Protected - Validates session & returns user)
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  const exp = req.jwtPayload?.exp;
  const iat = req.jwtPayload?.iat;
  const timeRemainingSeconds = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : TOKEN_EXPIRY_SECONDS;

  res.json({
    success: true,
    authenticated: true,
    user: userWithoutPassword,
    session: {
      algorithm: "HS256",
      issuedAt: iat ? new Date(iat * 1000).toISOString() : null,
      expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
      timeRemainingSeconds,
    },
  });
};

// GET /api/auth/session (Protected - Inspects current active session)
export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, authenticated: false, message: "No active session" });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  const exp = req.jwtPayload?.exp;
  const iat = req.jwtPayload?.iat;
  const timeRemainingSeconds = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 0;

  res.json({
    success: true,
    authenticated: true,
    user: userWithoutPassword,
    session: {
      algorithm: "HS256",
      userId: req.user.id,
      email: req.user.email,
      username: req.user.username,
      issuedAt: iat ? new Date(iat * 1000).toISOString() : null,
      expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
      timeRemainingSeconds,
      isExpiringSoon: timeRemainingSeconds < 3600, // less than 1 hour remaining
    },
  });
};

// POST /api/auth/refresh (Protected - Renews JWT token without re-entering credentials)
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required to refresh session." });
      return;
    }

    const session = generateSessionDetails(req.user.id, req.user.email, req.user.username);
    const { password: _, ...userWithoutPassword } = req.user;

    res.json({
      success: true,
      message: "Session token renewed successfully.",
      user: userWithoutPassword,
      token: session.token,
      session: {
        algorithm: "HS256",
        expiresAt: session.expiresAt,
        expiresInSeconds: session.expiresInSeconds,
        issuedAt: session.issuedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to refresh session." });
  }
};

// POST /api/auth/logout (Protected or public - Terminates session)
export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: "Session terminated successfully.",
    timestamp: new Date().toISOString(),
  });
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

    const { name, bio, avatar, currentPassword, newPassword } = req.body;
    let passwordUpdated = false;

    // Handle password update if requested
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: "Please enter your current password to set a new password.",
        });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long.",
        });
        return;
      }

      // Check current password
      let isMatch = false;
      if (req.user.password) {
        isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch && req.user.password === currentPassword) {
          isMatch = true;
        }
      }
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: "Current password does not match. Please verify and retry.",
        });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      if (isMongoDBConnected()) {
        await UserModel.findOneAndUpdate(
          { id: req.user.id },
          { password: hashedNewPassword }
        );
      }

      const memDb = getDb();
      const userIndex = memDb.users.findIndex((u) => u.id === req.user!.id);
      if (userIndex !== -1) {
        memDb.users[userIndex].password = hashedNewPassword;
      }
      req.user.password = hashedNewPassword;
      passwordUpdated = true;
    }

    const cleanName = name ? name.trim() : undefined;
    const cleanBio = bio !== undefined ? bio.trim() : undefined;
    const cleanAvatar = avatar ? avatar.trim() : undefined;

    if (isMongoDBConnected()) {
      await UserModel.findOneAndUpdate(
        { id: req.user.id },
        {
          ...(cleanName && { name: cleanName }),
          ...(cleanBio !== undefined && { bio: cleanBio }),
          ...(cleanAvatar && { avatar: cleanAvatar }),
        }
      );

      // Sync blog author information if name or avatar changed
      if (cleanName || cleanAvatar) {
        await BlogModel.updateMany(
          { authorId: req.user.id },
          {
            ...(cleanName && { authorName: cleanName }),
            ...(cleanAvatar && { authorAvatar: cleanAvatar }),
          }
        );
      }
    }

    const memDb = getDb();
    const userIndex = memDb.users.findIndex((u) => u.id === req.user!.id);
    if (userIndex !== -1) {
      if (cleanName) memDb.users[userIndex].name = cleanName;
      if (cleanBio !== undefined) memDb.users[userIndex].bio = cleanBio;
      if (cleanAvatar) memDb.users[userIndex].avatar = cleanAvatar;
    }

    if (cleanName || cleanAvatar) {
      memDb.blogs.forEach((b) => {
        if (b.authorId === req.user!.id) {
          if (cleanName) b.authorName = cleanName;
          if (cleanAvatar) b.authorAvatar = cleanAvatar;
        }
      });
    }

    const { password: _, ...userWithoutPassword } = {
      ...req.user,
      ...(cleanName && { name: cleanName }),
      ...(cleanBio !== undefined && { bio: cleanBio }),
      ...(cleanAvatar && { avatar: cleanAvatar }),
    };

    res.json({
      success: true,
      message: passwordUpdated
        ? "Profile and password updated successfully."
        : "Profile updated successfully.",
      user: userWithoutPassword,
      passwordUpdated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
  }
};

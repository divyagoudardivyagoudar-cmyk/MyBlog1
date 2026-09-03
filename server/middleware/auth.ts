import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../src/types.js";
import { UserModel } from "../models/User.js";
import { getDb } from "../db.js";
import { isMongoDBConnected } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "myblog_cyber_jwt_secret_key_2026";

export interface AuthRequest extends Request {
  user?: User;
}

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
};

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization required: No Bearer token provided",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    let user: User | null = null;

    if (isMongoDBConnected()) {
      const dbUser = await UserModel.findOne({ id: decoded.id }).lean();
      if (dbUser) {
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar,
          bio: dbUser.bio,
          joinedDate: dbUser.joinedDate,
        };
      }
    }

    if (!user) {
      const memUser = getDb().users.find((u) => u.id === decoded.id);
      if (memUser) {
        user = memUser;
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid session: User record not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};

export const optionalAuthenticateJWT = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    let user: User | null = null;

    if (isMongoDBConnected()) {
      const dbUser = await UserModel.findOne({ id: decoded.id }).lean();
      if (dbUser) {
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar,
          bio: dbUser.bio,
          joinedDate: dbUser.joinedDate,
        };
      }
    }

    if (!user) {
      const memUser = getDb().users.find((u) => u.id === decoded.id);
      if (memUser) {
        user = memUser;
      }
    }

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Gracefully continue in optional mode
  }
  next();
};

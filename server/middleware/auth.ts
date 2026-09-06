import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../src/types.js";
import { UserModel } from "../models/User.js";
import { getDb } from "../db.js";
import { isMongoDBConnected } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "myblog_cyber_jwt_secret_key_2026";
// Token lifespan: 7 days in seconds
export const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

export interface JWTPayload {
  sub: string;
  id: string;
  email: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
  jwtPayload?: JWTPayload;
}

export interface TokenSessionDetails {
  token: string;
  expiresInSeconds: number;
  expiresAt: string;
  issuedAt: string;
}

/**
 * Generate a cryptographically signed JWT token with standard claims
 */
export const generateToken = (userId: string, email: string, username?: string): string => {
  const payload: JWTPayload = {
    sub: userId,
    id: userId,
    email: email.toLowerCase().trim(),
    username: username?.trim(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: TOKEN_EXPIRY_SECONDS,
  });
};

/**
 * Generate complete token session details including expiry timestamps
 */
export const generateSessionDetails = (
  userId: string,
  email: string,
  username?: string
): TokenSessionDetails => {
  const token = generateToken(userId, email, username);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_SECONDS * 1000);

  return {
    token,
    expiresInSeconds: TOKEN_EXPIRY_SECONDS,
    expiresAt: expiresAt.toISOString(),
    issuedAt: now.toISOString(),
  };
};

/**
 * Strict authentication middleware.
 * Verifies JWT signature and expiry.
 * Returns distinct error codes (TOKEN_EXPIRED, INVALID_TOKEN) for robust client session handling.
 */
export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "Authorization required: No Bearer token provided in headers.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.trim() === "") {
    res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "Authorization required: Empty token provided.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JWTPayload;
    req.jwtPayload = decoded;

    const targetUserId = decoded.id || decoded.sub;
    let user: User | null = null;

    if (isMongoDBConnected()) {
      const dbUser = await UserModel.findOne({ id: targetUserId }).lean();
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
      const memUser = getDb().users.find((u) => u.id === targetUserId);
      if (memUser) {
        user = memUser;
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Invalid session: The user account associated with this token no longer exists.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError" || (jwt.TokenExpiredError && error instanceof jwt.TokenExpiredError)) {
      res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please sign in again to continue.",
        expiredAt: error.expiredAt,
      });
      return;
    }

    if (error?.name === "JsonWebTokenError" || (jwt.JsonWebTokenError && error instanceof jwt.JsonWebTokenError)) {
      res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid or tampered session token. Authorization denied.",
      });
      return;
    }

    res.status(401).json({
      success: false,
      code: "AUTH_FAILED",
      message: "Authentication verification failed.",
    });
    return;
  }
};

/**
 * Optional authentication middleware.
 * Attaches user and payload if token is valid, otherwise passes through.
 */
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
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JWTPayload;
    req.jwtPayload = decoded;

    const targetUserId = decoded.id || decoded.sub;
    let user: User | null = null;

    if (isMongoDBConnected()) {
      const dbUser = await UserModel.findOne({ id: targetUserId }).lean();
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
      const memUser = getDb().users.find((u) => u.id === targetUserId);
      if (memUser) {
        user = memUser;
      }
    }

    if (user) {
      req.user = user;
    }
  } catch (_err) {
    // Gracefully ignore token errors in optional mode
  }
  next();
};


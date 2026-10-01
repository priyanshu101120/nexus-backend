import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized: No access token provided",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: Invalid authorization format",
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session expired, please login again",
    });
  }
}
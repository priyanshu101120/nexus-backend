import Jwt from "jsonwebtoken";

// What YOU provide when signing a token
export interface JwtSignPayload {
  userId: string;
  email?: string;
  role?: string;
}

// What you GET BACK after verifying — jwt library auto-adds iat & exp
export interface JwtPayload extends JwtSignPayload {
  iat: number;
  exp: number;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export function signAccessToken(payload: JwtSignPayload): string {
  return Jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
}

export function signRefreshToken(payload: JwtSignPayload): string {
  return Jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return Jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return Jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
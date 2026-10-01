import { Response } from "express";
import { env } from "../config/env";

const isProd = env.NODE_ENV === "production";

export function setAuthCookies(
  res: Response,
  refreshToken: string,
) {
 res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });

}

export function clearAuthCookies(res: Response) {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}

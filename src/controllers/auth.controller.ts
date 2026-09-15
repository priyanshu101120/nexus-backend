import { Request, Response, NextFunction } from "express";
import { authService, ApiError } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { userRepository } from "../repositories/user.repository";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ message: "Registered successfully", user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Logged in successfully", user });
    } catch (error) {
      next(error);
    }
  },

  // NEW — Google Sign-In
  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const { user, accessToken, refreshToken } = await authService.googleLogin(idToken);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Logged in with Google successfully", user });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingToken = req.cookies?.refreshToken;
      if (!incomingToken) throw new ApiError(401, "No refresh token provided");

      const { user, accessToken, refreshToken } = await authService.refresh(incomingToken);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Token refreshed successfully", user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }
      clearAuthCookies(res);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.user!.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { passwordHash, refreshToken, ...safeUser } = user as any;
      res.status(200).json({ user: safeUser });
    } catch (err) {
      next(err);
    }
  },
};
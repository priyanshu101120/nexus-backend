import { Request, Response, NextFunction } from "express";
import { authService, ApiError } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { userRepository } from "../repositories/user.repository";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ message: "Registerd successfully", user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ message: "Logged in successfully", user });
    } catch (error) {
      next(error);
    }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const incommingTokens = req.cookies?.refreshToken;
      if (!incommingTokens) {
        throw new ApiError(401, "no refresh token provided");
      }
      const { user, accessToken, refreshToken } =
        await authService.refresh(incommingTokens);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Token refreshed successfully", user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
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
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { passwordHash, refreshToken, ...safeUser } = user;
      res.status(200).json({ user: safeUser });
    } catch (err) {
      next(err);
    }
  },
};

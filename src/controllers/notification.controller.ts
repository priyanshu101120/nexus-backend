import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const notifications = await notificationService.list(userId);

      res.status(200).json({
        notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await notificationService.markAsRead(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.userId;

      const result =
        await notificationService.markAllAsRead(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
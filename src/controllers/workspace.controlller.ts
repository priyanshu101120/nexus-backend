import { Request, Response, NextFunction } from "express";
import { workspaceService } from "../services/workspace.service";

export const workspaceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspace = await workspaceService.createWorkspace(
        req.body,
        userId,
      );

      res
        .status(201)
        .json({ message: "Workspace created successfully", workspace });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspace = await workspaceService.getMe(userId);
      res.status(200).json({ message: "workspace found", workspace });
    } catch (error) {
      next(error);
    }
  },
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { slug } = req.params;
      const workspace = await workspaceService.getBySlug(slug, userId);
      res.status(200).json({ workspace });
    } catch (error) {
      next(error);
    }
  },
};

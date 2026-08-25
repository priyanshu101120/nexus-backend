import { Request, Response, NextFunction } from "express";
import { invitationService } from "../services/invitataion.service";

export const invitationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const actorRole = req.workspaceRole!;
      const invitedById = req.user!.userId;

      const invitation = await invitationService.create(req.body, workspaceId, invitedById, actorRole);
      res.status(201).json({ message: "Invitation created successfully", invitation });
    } catch (error) {
      next(error);
    }
  },

  async listPending(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const invitations = await invitationService.listPending(workspaceId);
      res.status(200).json({ invitations });
    } catch (error) {
      next(error);
    }
  },

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const userId = req.user!.userId;

      const result = await invitationService.accept(token, userId);
      res.status(200).json({ message: "Invitation accepted successfully", ...result });
    } catch (error) {
      next(error);
    }
  },
};
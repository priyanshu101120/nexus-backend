import { Request, Response, NextFunction } from "express";
import { memberService } from "../services/member.service";

export const memberController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const members = await memberService.list(workspaceId);
      res.status(200).json({ members });
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const actorRole = req.workspaceRole!;
      const actorUserId = req.user!.userId;
      const { userId: targetUserId } = req.params;
      const { role } = req.body;

      const member = await memberService.updateRole(
        workspaceId,
        targetUserId,
        role,
        actorUserId,
        actorRole
      );
      res.status(200).json({ message: "Member role updated successfully", member });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const actorRole = req.workspaceRole!;
      const actorUserId = req.user!.userId;
      const { userId: targetUserId } = req.params;

      await memberService.remove(workspaceId, targetUserId, actorUserId, actorRole);
      res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      next(error);
    }
  },

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.userId;

      await memberService.leave(workspaceId, userId);
      res.status(200).json({ message: "Left workspace successfully" });
    } catch (error) {
      next(error);
    }
  },
};
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../services/auth.service";

// Extends Express Request with the resolved workspace + membership
// so downstream controllers don't have to look it up again.
declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      workspaceRole?: string;
    }
  }
}

export async function requireWorkspaceMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: { where: { userId } },
      },
    });

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    if (workspace.members.length === 0) {
      throw new ApiError(403, "You are not a member of this workspace");
    }

    req.workspaceId = workspace.id;
    req.workspaceRole = workspace.members[0].role;

    next();
  } catch (error) {
    next(error);
  }
}
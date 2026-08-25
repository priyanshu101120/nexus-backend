import { Router } from "express";
import { invitationController } from "../controllers/invitation.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireWorkspaceMember } from "../middleware/workspaceMember.middleware";
import { validate } from "../middleware/validate.middleware";
import { createInvitationSchema } from "../validators/invitation.validator";

// Nested under /workspaces/:slug/invitations — creating/listing invites
// requires you to already be a member of that workspace.
export const workspaceInvitationRouter = Router({ mergeParams: true });
workspaceInvitationRouter.use(requireAuth, requireWorkspaceMember);
workspaceInvitationRouter.post("/", validate(createInvitationSchema), invitationController.create);
workspaceInvitationRouter.get("/", invitationController.listPending);

// Top-level /invitations/:token/accept — accepting an invite happens
// BEFORE you're a workspace member, so it only needs requireAuth.
export const topLevelInvitationRouter = Router();
topLevelInvitationRouter.post("/:token/accept", requireAuth, invitationController.accept);
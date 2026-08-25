import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import memberRoutes from "./member.routes";
import {
  topLevelInvitationRouter,
  workspaceInvitationRouter,
} from "./invitation.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/workspace/:slug/projects", projectRoutes);
router.use("/workspace/:slug/projects/:projectId", taskRoutes);
router.use("/workspaces/:slug/members", memberRoutes);
router.use("/workspaces/:slug/invitations", workspaceInvitationRouter);
router.use("/invitations", topLevelInvitationRouter);
export default router;

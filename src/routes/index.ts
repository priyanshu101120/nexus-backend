import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/workspace/:slug/projects", projectRoutes);
router.use("/workspace/:slug/projects/:projectId", taskRoutes);
export default router;

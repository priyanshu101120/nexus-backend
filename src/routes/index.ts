import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace", workspaceRoutes);
export default router;

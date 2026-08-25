import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createWorkspaceSchema } from "../validators/workspace.validator";
import { workspaceController } from "../controllers/workspace.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createWorkspaceSchema),
  workspaceController.create,
);
router.get("/", requireAuth, workspaceController.getMe);
router.get("/:slug", requireAuth, workspaceController.getBySlug);

export default router;

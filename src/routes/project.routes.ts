import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireWorkspaceMember } from "../middleware/workspaceMember.middleware";
import { createProjectSchema } from "../validators/project.validater";
import { validate } from "../middleware/validate.middleware";
import { projectController } from "../controllers/Project.controller";

// mergeParams so this router can read :slug from the parent workspace route
const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.post("/", validate(createProjectSchema), projectController.create);
router.get("/", projectController.list);
router.get("/:projectId", projectController.getById);

export default router;

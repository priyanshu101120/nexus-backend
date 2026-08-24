import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireWorkspaceMember } from "../middleware/workspaceMember.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from "../validators/task.validator";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.post(
  "/columns/:columnId/tasks",
  validate(createTaskSchema),
  taskController.create,
);
router.patch(
  "/tasks/:taskId",
  validate(updateTaskSchema),
  taskController.update,
);
router.patch(
  "/tasks/:taskId/move",
  validate(moveTaskSchema),
  taskController.move,
);
router.delete("/tasks/:taskId", taskController.remove);

export default router;

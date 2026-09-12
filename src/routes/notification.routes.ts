import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { notificationController } from "../controllers/notification.controller";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.list);

router.patch(
  "/:id/read",
  notificationController.markAsRead
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

export default router;
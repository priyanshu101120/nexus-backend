import { Router } from "express";
import { memberController } from "../controllers/member.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireWorkspaceMember } from "../middleware/workspaceMember.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateMemberRoleSchema } from "../validators/member.validator";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.get("/", memberController.list);
router.delete("/me", memberController.leave); // must come BEFORE /:userId
router.patch("/:userId", validate(updateMemberRoleSchema), memberController.updateRole);
router.delete("/:userId", memberController.remove);

export default router;
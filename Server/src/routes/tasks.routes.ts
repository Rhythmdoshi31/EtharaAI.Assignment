import { Router } from "express";
import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
} from "../controllers/tasks.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.use(authMiddleware);

router.post("/", authorize("admin"), asyncWrapper(createTask));
router.get("/my", asyncWrapper(getMyTasks));
router.get("/:id", asyncWrapper(getTaskById));
router.patch("/:id/status", asyncWrapper(updateTaskStatus));

export default router;

import { Router } from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    addMember,
    removeMember,
} from "../controllers/projects.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.use(authMiddleware);

router.post("/", authorize("admin"), asyncWrapper(createProject));
router.get("/", asyncWrapper(getProjects));
router.get("/:id", asyncWrapper(getProjectById));
router.post("/:id/members", authorize("admin"), asyncWrapper(addMember));
router.delete("/:projectId/members/:userId", authorize("admin"), asyncWrapper(removeMember));

export default router;
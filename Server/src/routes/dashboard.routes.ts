import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncWrapper(getDashboard));

export default router;

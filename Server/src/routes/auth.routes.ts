import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", asyncWrapper(signup));
router.post("/login", asyncWrapper(login));
router.get("/me", authMiddleware, asyncWrapper(getMe));

export default router;

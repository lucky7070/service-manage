import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import adminAuthRoutes from "./adminAuth.routes.js";
import openRoutes from "./open.routes.js";

const router = Router();

router.use("/", openRoutes);
router.use("/auth", authRoutes);

router.use("/admin", adminAuthRoutes);
router.use("/admin", adminRoutes);

export default router;
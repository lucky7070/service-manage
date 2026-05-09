import { Router } from "express";
import { getDashboardStats } from "../../controller/admin/dashboard.controller.js";

const router = Router();
router.get("/dashboard-stats", getDashboardStats);

export default router;

import { Router } from "express";
// import { seedSettings } from "../controller/admin/setting.controller.js";
// import { createDefaultAdmin } from "../controller/admin/auth.controller.js";
import { getGeneralSettings } from "../controller/admin/setting.controller.js";

const router = Router();

// Seeder Routes
// router.post("/seed", createDefaultAdmin);
// router.get("/settings/seed", seedSettings);

// General Settings Routes
router.get("/general-settings", getGeneralSettings);

export default router;

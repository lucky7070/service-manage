import { Router } from "express";
import { getGeneralSettings } from "../controller/admin/setting.controller.js";

const router = Router();

// General Settings Routes
router.get("/general-settings", getGeneralSettings);

export default router;

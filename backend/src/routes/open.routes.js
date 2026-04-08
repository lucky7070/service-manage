import { Router } from "express";
import { getGeneralSettings } from "../controller/admin/setting.controller.js";
import { listServiceCategories, listCities } from "../controller/common.controller.js";
const router = Router();

// General Settings Routes
router.get("/general-settings", getGeneralSettings);
router.get("/service-categories-list", listServiceCategories);
router.get("/cities-list", listCities);

export default router;

import { Router } from "express";
import { getSettings, updateSettingsByType } from "../../controller/admin/setting.controller.js";
import { validator } from "../../libraries/validator.js";
import { appSettingStorage } from "../storages.js";

const router = Router();

router.get("/settings", getSettings);
router.get("/settings/:type", getSettings);
router.put("/settings/:type", appSettingStorage.any(), validator("setting-update"), updateSettingsByType);

export default router;

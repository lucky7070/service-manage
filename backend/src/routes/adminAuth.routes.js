import { Router } from "express";
import { validator } from "../libraries/validator.js";
import { adminLogin, requestAdminForgotPassword, resetAdminPasswordWithToken } from "../controller/admin/auth.controller.js";

const router = Router();

router.post("/login", adminLogin);
router.post("/forgot-password", validator("admin-forgot-password"), requestAdminForgotPassword);
router.post("/forgot-password/reset", validator("admin-forgot-password-reset"), resetAdminPasswordWithToken);

export default router;

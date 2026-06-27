import { Router } from "express";
import { adminLogout, adminProfile, markAllAdminNotificationsRead, updateAdminProfile, updateAdminProfileImage, updateAdminPassword } from "../../controller/admin/auth.controller.js";
import { validator } from "../../libraries/validator.js";
import { adminStorage } from "../storages.js";

const router = Router();

router.get("/profile", adminProfile);
router.put("/notifications/read-all", markAllAdminNotificationsRead);
router.put("/profile", validator("admin-profile"), updateAdminProfile);
router.put("/profile/password", validator("admin-profile-password"), updateAdminPassword);
router.put("/profile/image", adminStorage.single("image"), validator("admin-profile-image"), updateAdminProfileImage);
router.post("/logout", adminLogout);

export default router;

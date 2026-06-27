import { Router } from "express";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, getSingleAdmin, addAdminPermission } from "../../controller/admin/subAdmin.controller.js";
import { validator } from "../../libraries/validator.js";
import { adminStorage } from "../storages.js";

const router = Router();

router.get("/admins", listAdmins);
router.post("/admins", adminStorage.single("image"), validator("admin"), createAdmin);
router.put("/admins/:id", adminStorage.single("image"), validator("admin-update"), updateAdmin);
router.put("/admins/:id/permissions", addAdminPermission);
router.delete("/admins/:id", deleteAdmin);
router.get("/admins/:id", getSingleAdmin);

export default router;

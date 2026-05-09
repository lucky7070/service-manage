import { Router } from "express";
import { getRole, createRole, updateRole, deleteRole, getSingleRole, addPermission } from "../../controller/admin/role.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.post("/roles", validator("role"), createRole);
router.put("/roles/:id", validator("role"), updateRole);
router.delete("/roles/:id", deleteRole);
router.get("/roles/:id", getSingleRole);
router.get("/roles", getRole);
router.put("/roles/:id/permissions", addPermission);

export default router;

import { Router } from "express";
import { listFranchises, createFranchise, updateFranchise, deleteFranchise, getSingleFranchise } from "../../controller/admin/franchise.controller.js";
import { validator } from "../../libraries/validator.js";
import { franchiseStorage } from "../storages.js";

const router = Router();

router.get("/franchises", listFranchises);
router.post("/franchises", franchiseStorage.single("image"), validator("franchise"), createFranchise);
router.put("/franchises/:id", franchiseStorage.single("image"), validator("franchise-update"), updateFranchise);
router.delete("/franchises/:id", deleteFranchise);
router.get("/franchises/:id", getSingleFranchise);

export default router;

import { Router } from "express";
import { createOurValue, updateOurValue, deleteOurValue, getOurValues } from "../../controller/admin/ourValue.controller.js";
import { createOurMilestone, updateOurMilestone, deleteOurMilestone, getOurMilestones } from "../../controller/admin/ourMilestone.controller.js";
import { validator } from "../../libraries/validator.js";
import { ourValueStorage } from "./storages.js";

const router = Router();

router.post("/our-values", ourValueStorage.single("icon"), validator("our-value-create"), createOurValue);
router.put("/our-values/:id", ourValueStorage.single("icon"), validator("our-value-update"), updateOurValue);
router.delete("/our-values/:id", deleteOurValue);
router.get("/our-values", getOurValues);

router.post("/our-milestones", validator("our-milestone"), createOurMilestone);
router.put("/our-milestones/:id", validator("our-milestone"), updateOurMilestone);
router.delete("/our-milestones/:id", deleteOurMilestone);
router.get("/our-milestones", getOurMilestones);

export default router;

import { Router } from "express";
import { getServiceType, createServiceType, updateServiceType, deleteServiceType, getSingleServiceType } from "../../controller/admin/serviceType.controller.js";
import { validator } from "../../libraries/validator.js";
import { serviceTypeStorage } from "../storages.js";

const router = Router();

router.post("/service-types", serviceTypeStorage.single("image"), validator("service-type"), createServiceType);
router.put("/service-types/:id", serviceTypeStorage.single("image"), validator("service-type"), updateServiceType);
router.delete("/service-types/:id", deleteServiceType);
router.get("/service-types/:id", getSingleServiceType);
router.get("/service-types", getServiceType);

export default router;

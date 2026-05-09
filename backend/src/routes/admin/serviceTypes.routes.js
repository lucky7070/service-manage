import { Router } from "express";
import { getServiceType, createServiceType, updateServiceType, deleteServiceType, getSingleServiceType } from "../../controller/admin/serviceType.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.post("/service-types", validator("service-type"), createServiceType);
router.put("/service-types/:id", validator("service-type"), updateServiceType);
router.delete("/service-types/:id", deleteServiceType);
router.get("/service-types/:id", getSingleServiceType);
router.get("/service-types", getServiceType);

export default router;

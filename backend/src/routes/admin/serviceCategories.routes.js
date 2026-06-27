import { Router } from "express";
import { listServiceCategoriesForSelect, createServiceCategory, updateServiceCategory, deleteServiceCategory, getServiceCategory, getSingleServiceCategory } from "../../controller/admin/serviceCategory.controller.js";
import { validator } from "../../libraries/validator.js";
import { serviceCategoryStorage } from "../storages.js";

const router = Router();

router.get("/service-categories/options", listServiceCategoriesForSelect);
router.post("/service-categories", serviceCategoryStorage.single("image"), validator("service-category"), createServiceCategory);
router.put("/service-categories/:id", serviceCategoryStorage.single("image"), validator("service-category"), updateServiceCategory);
router.delete("/service-categories/:id", deleteServiceCategory);
router.get("/service-categories/:id", getSingleServiceCategory);
router.get("/service-categories", getServiceCategory);

export default router;

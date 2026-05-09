import { Router } from "express";
import { createCmsPage, deleteCmsPage, getCmsPages, getSingleCmsPage, updateCmsPage } from "../../controller/admin/cmsPage.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.post("/cms-pages", validator("cms-page"), createCmsPage);
router.put("/cms-pages/:id", validator("cms-page"), updateCmsPage);
router.delete("/cms-pages/:id", deleteCmsPage);
router.get("/cms-pages/:id", getSingleCmsPage);
router.get("/cms-pages", getCmsPages);

export default router;

import { Router } from "express";
import { createBanner, deleteBanner, getBanner, updateBanner } from "../../controller/admin/banner.controller.js";
import { validator } from "../../libraries/validator.js";
import { bannerStorage } from "../storages.js";

const router = Router();

router.post("/banners", bannerStorage.single("bannerImage"), validator("banner"), createBanner);
router.put("/banners/:id", bannerStorage.single("bannerImage"), validator("banner"), updateBanner);
router.delete("/banners/:id", deleteBanner);
router.get("/banners", getBanner);

export default router;

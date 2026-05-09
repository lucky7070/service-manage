import { Router } from "express";
import { getPredefinedRatingTag, createPredefinedRatingTag, updatePredefinedRatingTag, deletePredefinedRatingTag, getSinglePredefinedRatingTag } from "../../controller/admin/predefinedRatingTag.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.post("/rating-tags", validator("rating-tag"), createPredefinedRatingTag);
router.put("/rating-tags/:id", validator("rating-tag"), updatePredefinedRatingTag);
router.delete("/rating-tags/:id", deletePredefinedRatingTag);
router.get("/rating-tags/:id", getSinglePredefinedRatingTag);
router.get("/rating-tags", getPredefinedRatingTag);

export default router;

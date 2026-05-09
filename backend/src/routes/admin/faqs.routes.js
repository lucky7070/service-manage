import { Router } from "express";
import { createFaq, deleteFaq, getFaq, getSingleFaq, updateFaq } from "../../controller/admin/faq.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.post("/faqs", validator("faq"), createFaq);
router.put("/faqs/:id", validator("faq"), updateFaq);
router.delete("/faqs/:id", deleteFaq);
router.get("/faqs/:id", getSingleFaq);
router.get("/faqs", getFaq);

export default router;

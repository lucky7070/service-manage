import { Router } from "express";
import { createTestimonial, deleteTestimonial, getSingleTestimonial, getTestimonial, updateTestimonial } from "../../controller/admin/testimonial.controller.js";
import { validator } from "../../libraries/validator.js";
import { testimonialStorage } from "../storages.js";

const router = Router();

router.post("/testimonials", testimonialStorage.single("image"), validator("testimonial"), createTestimonial);
router.put("/testimonials/:id", testimonialStorage.single("image"), validator("testimonial"), updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);
router.get("/testimonials/:id", getSingleTestimonial);
router.get("/testimonials", getTestimonial);

export default router;

import { Router } from "express";
import { getGeneralSettings } from "../controller/admin/setting.controller.js";
import { listServiceCategories, listServiceCategoriesForHome, getServiceCategoryBySlug, listCities, listTestimonials, submitEnquiry, getPrivacyPolicy, getTermsAndConditions, getAboutContent, listServiceProviders, getPublicServiceProvider } from "../controller/common.controller.js";
import { validator } from "../libraries/validator.js";

const router = Router();

// General Settings Routes
router.get("/general-settings", getGeneralSettings);
router.get("/service-categories-list", listServiceCategories);
router.get("/service-categories-home", listServiceCategoriesForHome);
router.get("/service-categories/:slug", getServiceCategoryBySlug);
router.get("/service-providers/:city/:serviceCategory", listServiceProviders);
router.get("/service-provider/:id", getPublicServiceProvider);
router.get("/cities-list", listCities);
router.get("/testimonials", listTestimonials);
router.get("/about-content", getAboutContent);
router.post("/enquiries", validator("enquiry-submit"), submitEnquiry);
router.get("/privacy-policy", getPrivacyPolicy);
router.get("/terms-and-conditions", getTermsAndConditions);

export default router;

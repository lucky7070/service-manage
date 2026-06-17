import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/adminAuth.js";
import dashboardRoutes from "./dashboard.routes.js";
import bookingRoutes from "./booking.routes.js";
import serviceLeadRoutes from "./serviceLead.routes.js";
import profileRoutes from "./profile.routes.js";
import settingsRoutes from "./settings.routes.js";
import rolesRoutes from "./roles.routes.js";
import subAdminsRoutes from "./subAdmins.routes.js";
import geographyRoutes from "./geography.routes.js";
import customersRoutes from "./customers.routes.js";
import serviceProvidersRoutes from "./serviceProviders.routes.js";
import ratingTagsRoutes from "./ratingTags.routes.js";
import faqsRoutes from "./faqs.routes.js";
import serviceCategoriesRoutes from "./serviceCategories.routes.js";
import serviceTypesRoutes from "./serviceTypes.routes.js";
import bannersRoutes from "./banners.routes.js";
import enquiriesRoutes from "./enquiries.routes.js";
import testimonialsRoutes from "./testimonials.routes.js";
import cmsPagesRoutes from "./cmsPages.routes.js";
import subscriptionsRoutes from "./subscriptions.routes.js";
import ourContentRoutes from "./ourContent.routes.js";

const router = Router();

router.use(requireAdminAuth);

router.use(dashboardRoutes);
router.use(bookingRoutes);
router.use(serviceLeadRoutes);
router.use(profileRoutes);
router.use(settingsRoutes);
router.use(rolesRoutes);
router.use(subAdminsRoutes);
router.use(geographyRoutes);
router.use(customersRoutes);
router.use(serviceProvidersRoutes);
router.use(ratingTagsRoutes);
router.use(faqsRoutes);
router.use(serviceCategoriesRoutes);
router.use(serviceTypesRoutes);
router.use(bannersRoutes);
router.use(enquiriesRoutes);
router.use(testimonialsRoutes);
router.use(cmsPagesRoutes);
router.use(subscriptionsRoutes);
router.use(ourContentRoutes);

export default router;

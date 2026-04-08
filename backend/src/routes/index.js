import { Router } from "express";
import customerRoutes from "./customer.routes.js";
import adminRoutes from "./admin.routes.js";
import adminAuthRoutes from "./adminAuth.routes.js";
import openRoutes from "./open.routes.js";
import serviceProviderRoutes from "./service-provider.routes.js";

const router = Router();

router.use("/", openRoutes);
router.use("/customer", customerRoutes);
router.use("/service-provider", serviceProviderRoutes);

router.use("/admin", adminAuthRoutes);
router.use("/admin", adminRoutes);

export default router;
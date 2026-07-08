import { Router } from "express";
import { listPurchasedPlans, getPurchasedPlanGatewayStatus } from "../../controller/admin/assignedSubscription.controller.js";

const router = Router();

router.get("/purchased-plans", listPurchasedPlans);
router.get("/purchased-plans/:id/gateway-status", getPurchasedPlanGatewayStatus);

export default router;

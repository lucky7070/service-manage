import { Router } from "express";
import { createSubscription, deleteSubscription, getSingleSubscription, getSubscription, updateSubscription } from "../../controller/admin/subscription.controller.js";
import { validator } from "../../libraries/validator.js";
import { subscriptionStorage } from "../storages.js";

const router = Router();

router.post("/subscriptions", subscriptionStorage.single("image"), validator("subscription"), createSubscription);
router.put("/subscriptions/:id", subscriptionStorage.single("image"), validator("subscription"), updateSubscription);
router.delete("/subscriptions/:id", deleteSubscription);
router.get("/subscriptions", getSubscription);
router.get("/subscriptions/:id", getSingleSubscription);

export default router;

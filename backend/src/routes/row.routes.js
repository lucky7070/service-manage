import { Router } from "express";
import express from "express";
import { razorpayWebhook } from "../controller/razorpayWebhook.controller.js";

const router = Router();
router.post("/webhooks/razorpay", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;

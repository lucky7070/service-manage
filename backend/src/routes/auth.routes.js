import { Router } from "express";
import { sendOtp, verifyOtp } from "../controller/auth.controller.js";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;

import { Router } from "express";
import { sendOtp, register, profile, logout } from "../controller/auth.controller.js";
import { requireCustomerAuth } from "../middlewares/customerAuth.js";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);

router.use(requireCustomerAuth);
router.get("/profile", profile);
router.post("/logout", logout);


export default router;

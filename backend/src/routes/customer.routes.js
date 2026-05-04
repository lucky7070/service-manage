import { Router } from "express";
import { sendOtp, register, profile, updateProfile, logout } from "../controller/auth.controller.js";
import { createCustomerAddress, updateCustomerAddress, deleteCustomerAddress, getCustomerDashboard, listCustomerAddresses, listCustomerBookings, listCustomerLedger } from "../controller/customer.controller.js";
import { requireCustomerAuth } from "../middlewares/customerAuth.js";
import { validator } from "../libraries/validator.js";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);

router.use(requireCustomerAuth);
router.get("/profile", profile);
router.put("/profile", validator("customer-profile-update"), updateProfile);
router.get("/dashboard", getCustomerDashboard);
router.get("/bookings", listCustomerBookings);
router.get("/ledger", listCustomerLedger);
router.get("/addresses", listCustomerAddresses);
router.post("/addresses", validator("customer-self-address"), createCustomerAddress);
router.put("/addresses/:addressId", validator("customer-self-address-update"), updateCustomerAddress);
router.delete("/addresses/:addressId", deleteCustomerAddress);
router.post("/logout", logout);


export default router;

import { Router } from "express";
import { sendOtp, register, profile, updateProfile, logout } from "../controller/auth.controller.js";
import { acceptCustomerBookingQuote, cancelCustomerBooking, createCustomerAddress, createCustomerBooking, getCustomerBooking, updateCustomerAddress, deleteCustomerAddress, getCustomerDashboard, listCustomerAddresses, listCustomerBookingMessages, listCustomerBookings, listCustomerLedger, sendCustomerBookingMessage } from "../controller/customer.controller.js";
import { requireCustomerAuth } from "../middlewares/customerAuth.js";
import { otpRateLimiter } from "../middlewares/otpRateLimiter.js";
import { validator } from "../libraries/validator.js";

const router = Router();

router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/register", register);

router.use(requireCustomerAuth);
router.get("/profile", profile);
router.put("/profile", validator("customer-profile-update"), updateProfile);
router.get("/dashboard", getCustomerDashboard);
router.get("/bookings", listCustomerBookings);
router.post("/bookings", validator("customer-booking-create"), createCustomerBooking);
router.get("/bookings/:bookingId", validator("customer-booking-id"), getCustomerBooking);
router.put("/bookings/:bookingId/accept-quote", validator("customer-booking-id"), acceptCustomerBookingQuote);
router.put("/bookings/:bookingId/cancel", validator("customer-booking-id"), cancelCustomerBooking);
router.get("/bookings/:bookingId/messages", validator("customer-booking-id"), listCustomerBookingMessages);
router.post("/bookings/:bookingId/messages", validator("booking-message"), sendCustomerBookingMessage);
router.get("/ledger", listCustomerLedger);
router.get("/addresses", listCustomerAddresses);
router.post("/addresses", validator("customer-self-address"), createCustomerAddress);
router.put("/addresses/:addressId", validator("customer-self-address-update"), updateCustomerAddress);
router.delete("/addresses/:addressId", deleteCustomerAddress);
router.post("/logout", logout);


export default router;

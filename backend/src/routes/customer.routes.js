import { Router } from "express";
import { sendOtp, register, profile, updateProfile, updateCustomerProfileImage, logout, deleteCustomerAccount } from "../controller/auth.controller.js";
import { acceptCustomerBookingQuote, cancelCustomerBooking, completeCustomerBooking, createCustomerAddress, createCustomerBooking, createCustomerServiceLead, getCustomerBooking, updateCustomerAddress, deleteCustomerAddress, getCustomerDashboard, listCustomerAddresses, listCustomerBookingMessages, listCustomerBookings, listCustomerLedger, listCustomerServiceLeads, sendCustomerBookingMessage, submitCustomerBookingFeedback } from "../controller/customer.controller.js";
import { requireCustomerAuth } from "../middlewares/customerAuth.js";
import { otpRateLimiter } from "../middlewares/otpRateLimiter.js";
import { validator } from "../libraries/validator.js";
import { customerStorage, bookingChatStorage } from "./admin/storages.js";

const router = Router();

router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/register", register);

router.use(requireCustomerAuth);
router.get("/profile", profile);
router.put("/profile", validator("customer-profile-update"), updateProfile);
router.put("/profile/image", customerStorage.single("image"), validator("customer-profile-image"), updateCustomerProfileImage);
router.delete("/profile", deleteCustomerAccount);
router.get("/dashboard", getCustomerDashboard);
router.get("/bookings", listCustomerBookings);
router.post("/bookings", validator("customer-booking-create"), createCustomerBooking);
router.get("/service-leads", listCustomerServiceLeads);
router.post("/service-leads", validator("customer-service-lead-create"), createCustomerServiceLead);
router.get("/bookings/:bookingId", validator("customer-booking-id"), getCustomerBooking);
router.put("/bookings/:bookingId/accept-quote", validator("customer-booking-id"), acceptCustomerBookingQuote);
router.put("/bookings/:bookingId/cancel", validator("customer-booking-id"), cancelCustomerBooking);
router.put("/bookings/:bookingId/complete", validator("customer-booking-id"), completeCustomerBooking);
router.get("/bookings/:bookingId/messages", validator("customer-booking-id"), listCustomerBookingMessages);
router.post("/bookings/:bookingId/messages", bookingChatStorage.single("image"), validator("booking-message"), sendCustomerBookingMessage);
router.post("/bookings/:bookingId/feedback", validator("booking-feedback"), submitCustomerBookingFeedback);
router.get("/ledger", listCustomerLedger);
router.get("/addresses", listCustomerAddresses);
router.post("/addresses", validator("customer-self-address"), createCustomerAddress);
router.put("/addresses/:addressId", validator("customer-self-address-update"), updateCustomerAddress);
router.delete("/addresses/:addressId", deleteCustomerAddress);
router.post("/logout", logout);


export default router;

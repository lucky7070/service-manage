import { Router } from "express";
import { sendOtp, register, login, profile, logout, deleteServiceProviderAccount, getServiceProviderDashboard, getProviderNotificationUnreadCount, getWorkPhotos, uploadWorkPhotos, deleteWorkPhoto, reorderWorkPhotos, listProviderBookings, listProviderNotifications, getProviderBooking, listProviderBookingMessages, sendProviderBookingMessage, setBookingQuote, cancelProviderBooking, startProviderBooking, sendBookingCompletionOtp, completeProviderBooking, submitProviderBookingFeedback, markAllProviderNotificationsRead } from "../controller/service-provider.controller.js";
import { createMyProviderService, deleteMyProviderService, listMyProviderServices, listMyServiceTypeOptions, updateMyProviderService } from "../controller/service-provider-services.controller.js";
import { createProviderSubscriptionOrder, updateProviderSubscriptionPayment } from "../controller/providerSubscription.controller.js";
import { validator } from "../libraries/validator.js";
import { requireServiceProviderAuth } from "../middlewares/serviceProviderAuth.js";
import { otpRateLimiter } from "../middlewares/otpRateLimiter.js";
import { Storage } from "../libraries/storage.js";
import { bookingChatStorage } from "./admin/storages.js";

const router = Router();
const serviceProviderStorage = new Storage({ dir: "service-provider", isImage: true, isDoc: true, fileSize: 5 });
const serviceProviderWorkPhotoStorage = new Storage({ dir: "service-provider-work", isImage: true, isDoc: false, fileSize: 2 });

router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/login", validator("service-provider-login"), login);
router.post("/register", serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]), validator("service-provider-register"), register);

router.use(requireServiceProviderAuth);
router.get("/dashboard", getServiceProviderDashboard);
router.get("/notifications/unread-count", getProviderNotificationUnreadCount);
router.get("/notifications", listProviderNotifications);
router.put("/notifications/read-all", markAllProviderNotificationsRead);
router.get("/profile", profile);
router.delete("/profile", deleteServiceProviderAccount);
router.post("/logout", logout);
router.get("/services", listMyProviderServices);
router.get("/service-types", listMyServiceTypeOptions);
router.post("/services", validator("provider-service-create"), createMyProviderService);
router.put("/services/:serviceId", validator("provider-service-update"), updateMyProviderService);
router.delete("/services/:serviceId", validator("provider-service-delete"), deleteMyProviderService);
router.get("/bookings", listProviderBookings);
router.get("/bookings/:bookingId", validator("customer-booking-id"), getProviderBooking);
router.put("/bookings/:bookingId/quote", validator("booking-quote"), setBookingQuote);
router.put("/bookings/:bookingId/cancel", validator("customer-booking-id"), cancelProviderBooking);
router.post("/bookings/:bookingId/start", validator("provider-booking-start"), startProviderBooking);
router.post("/bookings/:bookingId/complete/send-otp", otpRateLimiter, validator("customer-booking-id"), sendBookingCompletionOtp);
router.post("/bookings/:bookingId/complete", validator("booking-completion-verify"), completeProviderBooking);
router.get("/bookings/:bookingId/messages", validator("customer-booking-id"), listProviderBookingMessages);
router.post("/bookings/:bookingId/messages", bookingChatStorage.single("image"), validator("booking-message"), sendProviderBookingMessage);
router.post("/bookings/:bookingId/feedback", validator("booking-feedback"), submitProviderBookingFeedback);
router.get("/work-photos", getWorkPhotos);
router.post("/work-photos", serviceProviderWorkPhotoStorage.array("photos", 20), uploadWorkPhotos);
router.delete("/work-photos/:photoId", deleteWorkPhoto);
router.put("/work-photos/reorder", reorderWorkPhotos);
router.post("/subscriptions/purchase", validator("provider-subscription-purchase"), createProviderSubscriptionOrder);
router.post("/subscriptions/purchase/payment", validator("provider-subscription-payment"), updateProviderSubscriptionPayment);

export default router;
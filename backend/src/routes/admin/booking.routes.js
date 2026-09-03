import { Router } from "express";
import { getBookingDetail, getBookings, exportBookings, lookupCustomerByMobile, createBookingWithCustomer } from "../../controller/admin/booking.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();
router.get("/bookings/export", exportBookings);
router.get("/bookings/lookup-customer", lookupCustomerByMobile);
router.post("/bookings/create-with-customer", validator("admin-booking-create-with-customer"), createBookingWithCustomer);
router.get("/bookings/:id", getBookingDetail);
router.get("/bookings", getBookings);

export default router;

import { Router } from "express";
import { getBookingDetail, getBookings } from "../../controller/admin/booking.controller.js";

const router = Router();
router.get("/bookings/:id", getBookingDetail);
router.get("/bookings", getBookings);

export default router;

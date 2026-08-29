import { Router } from "express";
import { getBookingDetail, getBookings, exportBookings } from "../../controller/admin/booking.controller.js";

const router = Router();
router.get("/bookings/export", exportBookings);
router.get("/bookings/:id", getBookingDetail);
router.get("/bookings", getBookings);

export default router;

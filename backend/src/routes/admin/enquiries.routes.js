import { Router } from "express";
import { deleteEnquiry, getEnquiry, resolveEnquiry } from "../../controller/admin/enquiry.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.get("/enquiries", getEnquiry);
router.put("/enquiries/:id/resolve", validator("enquiry-resolve"), resolveEnquiry);
router.delete("/enquiries/:id", deleteEnquiry);

export default router;

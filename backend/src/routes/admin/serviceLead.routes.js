import { Router } from "express";
import { assignServiceLead, cancelServiceLead, getServiceLeadDetail, listServiceLeads } from "../../controller/admin/serviceLead.controller.js";
import { validator } from "../../libraries/validator.js";

const router = Router();

router.get("/service-leads", listServiceLeads);
router.get("/service-leads/:id", validator("admin-service-lead-id"), getServiceLeadDetail);
router.put("/service-leads/:id/assign", validator("admin-service-lead-assign"), assignServiceLead);
router.put("/service-leads/:id/cancel", validator("admin-service-lead-id"), cancelServiceLead);

export default router;

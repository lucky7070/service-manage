import { Router } from "express";
import { getServiceProvider, createServiceProvider, updateServiceProvider, updateServiceProviderStatus, deleteServiceProvider, getSingleServiceProvider } from "../../controller/admin/serviceProvider.controller.js";
import { getServiceProviderPhotos, uploadServiceProviderPhotos, deleteServiceProviderPhoto, reorderServiceProviderPhotos } from "../../controller/admin/serviceProviderPhoto.controller.js";
import { createProviderService, deleteProviderService, getProviderServices, updateProviderService } from "../../controller/admin/providerService.controller.js";
import { assignSubscriptionToProvider, getProviderAssignedSubscriptions } from "../../controller/admin/assignedSubscription.controller.js";
import { validator } from "../../libraries/validator.js";
import { serviceProviderStorage, serviceProviderWorkPhotoStorage } from "./storages.js";

const router = Router();

router.post(
    "/service-providers",
    serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]),
    validator("service-provider"),
    createServiceProvider
);
router.put(
    "/service-providers/:id",
    serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]),
    validator("service-provider"),
    updateServiceProvider
);
router.put("/service-providers/:id/status", validator("service-provider-status"), updateServiceProviderStatus);
router.delete("/service-providers/:id", deleteServiceProvider);
router.get("/service-providers/:id", getSingleServiceProvider);
router.get("/service-providers", getServiceProvider);
router.get("/service-providers/:id/photos", getServiceProviderPhotos);
router.post("/service-providers/:id/photos", serviceProviderWorkPhotoStorage.array("photos", 20), uploadServiceProviderPhotos);
router.put("/service-providers/:id/photos/reorder", reorderServiceProviderPhotos);
router.delete("/service-providers/:id/photos/:photoId", deleteServiceProviderPhoto);
router.get("/service-providers/:id/services", getProviderServices);
router.post("/service-providers/:id/services", createProviderService);
router.put("/service-providers/:id/services/:serviceId", updateProviderService);
router.delete("/service-providers/:id/services/:serviceId", deleteProviderService);
router.get("/service-providers/:id/subscriptions", getProviderAssignedSubscriptions);
router.post("/service-providers/:id/subscriptions", validator("provider-subscription-assign"), assignSubscriptionToProvider);

export default router;

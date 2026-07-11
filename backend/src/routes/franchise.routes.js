import { Router } from "express";
import { requireFranchiseAuth } from "../middlewares/franchiseAuth.js";
import {
    franchiseLogin,
    franchiseLogout,
    franchiseProfile,
    updateFranchiseProfile,
    updateFranchiseProfileImage,
    updateFranchisePassword
} from "../controller/franchise/auth.controller.js";
import {
    getFranchiseDashboard,
    listFranchiseServiceProviders,
    getFranchiseServiceProvider,
    createFranchiseServiceProvider,
    updateFranchiseServiceProvider,
    deleteFranchiseServiceProvider,
    getFranchiseServiceProviderPhotos,
    uploadFranchiseServiceProviderPhotos,
    deleteFranchiseServiceProviderPhoto,
    reorderFranchiseServiceProviderPhotos,
    listFranchiseServiceTypeOptions,
    getFranchiseProviderServices,
    createFranchiseProviderService,
    updateFranchiseProviderService,
    deleteFranchiseProviderService,
    getFranchiseProviderSubscriptions
} from "../controller/franchise/serviceProvider.controller.js";
import { validator } from "../libraries/validator.js";
import { franchiseStorage, serviceProviderStorage, serviceProviderWorkPhotoStorage } from "./storages.js";

const router = Router();

router.post("/login", franchiseLogin);

router.use(requireFranchiseAuth);
router.get("/dashboard", getFranchiseDashboard);
router.get("/profile", franchiseProfile);
router.put("/profile", validator("admin-profile"), updateFranchiseProfile);
router.put("/profile/password", validator("admin-profile-password"), updateFranchisePassword);
router.put("/profile/image", franchiseStorage.single("image"), validator("admin-profile-image"), updateFranchiseProfileImage);
router.post("/logout", franchiseLogout);

router.get("/service-types", listFranchiseServiceTypeOptions);
router.get("/service-providers", listFranchiseServiceProviders);
router.post(
    "/service-providers",
    serviceProviderStorage.fields([
        { name: "image", maxCount: 1 },
        { name: "panCardDocument", maxCount: 1 },
        { name: "aadharDocument", maxCount: 1 },
        { name: "policeVerification", maxCount: 1 }
    ]),
    validator("service-provider"),
    createFranchiseServiceProvider
);
router.put(
    "/service-providers/:id",
    serviceProviderStorage.fields([
        { name: "image", maxCount: 1 },
        { name: "panCardDocument", maxCount: 1 },
        { name: "aadharDocument", maxCount: 1 },
        { name: "policeVerification", maxCount: 1 }
    ]),
    validator("service-provider"),
    updateFranchiseServiceProvider
);
router.get("/service-providers/:id/photos", getFranchiseServiceProviderPhotos);
router.post("/service-providers/:id/photos", serviceProviderWorkPhotoStorage.array("photos", 20), uploadFranchiseServiceProviderPhotos);
router.put("/service-providers/:id/photos/reorder", reorderFranchiseServiceProviderPhotos);
router.delete("/service-providers/:id/photos/:photoId", deleteFranchiseServiceProviderPhoto);
router.get("/service-providers/:id/services", getFranchiseProviderServices);
router.post("/service-providers/:id/services", createFranchiseProviderService);
router.put("/service-providers/:id/services/:serviceId", updateFranchiseProviderService);
router.delete("/service-providers/:id/services/:serviceId", deleteFranchiseProviderService);
router.get("/service-providers/:id/subscriptions", getFranchiseProviderSubscriptions);
router.delete("/service-providers/:id", deleteFranchiseServiceProvider);
router.get("/service-providers/:id", getFranchiseServiceProvider);

export default router;

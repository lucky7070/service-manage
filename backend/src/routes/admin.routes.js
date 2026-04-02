import { Router } from "express";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import { validator } from "../libraries/validator.js";
import { adminLogout, adminProfile, markAllAdminNotificationsRead, updateAdminProfile, updateAdminProfileImage, updateAdminPassword } from "../controller/admin/auth.controller.js";
import { getRole, createRole, updateRole, deleteRole, getSingleRole, addPermission } from "../controller/admin/role.controller.js";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, getSingleAdmin, addAdminPermission } from "../controller/admin/subAdmin.controller.js";
import { getSettings, updateSettingsByType } from "../controller/admin/setting.controller.js";
import { getCountry, createCountry, updateCountry, deleteCountry, getSingleCountry } from "../controller/admin/country.controller.js";
import { getState, createState, updateState, deleteState, getSingleState } from "../controller/admin/state.controller.js";
import { getCity, createCity, updateCity, deleteCity, getSingleCity } from "../controller/admin/city.controller.js";
import { getCustomer, createCustomer, updateCustomer, deleteCustomer, getSingleCustomer } from "../controller/admin/customer.controller.js";
import { getServiceProvider, createServiceProvider, updateServiceProvider, updateServiceProviderStatus, deleteServiceProvider, getSingleServiceProvider } from "../controller/admin/serviceProvider.controller.js";
import { getServiceProviderPhotos, uploadServiceProviderPhotos, deleteServiceProviderPhoto, reorderServiceProviderPhotos } from "../controller/admin/serviceProviderPhoto.controller.js";
import { getPredefinedRatingTag, createPredefinedRatingTag, updatePredefinedRatingTag, deletePredefinedRatingTag, getSinglePredefinedRatingTag } from "../controller/admin/predefinedRatingTag.controller.js";
import { listServiceCategoriesForSelect, createServiceCategory, updateServiceCategory, deleteServiceCategory, getServiceCategory, getSingleServiceCategory } from "../controller/admin/serviceCategory.controller.js";
import { getServiceType, createServiceType, updateServiceType, deleteServiceType, getSingleServiceType } from "../controller/admin/serviceType.controller.js";
import { getDashboardStats } from "../controller/admin/dashboard.controller.js";
import { Storage } from "../libraries/storage.js";

const router = Router();
const adminStorage = new Storage({ dir: "admins", isImage: true, isDoc: false, fileSize: 2 });
const appSettingStorage = new Storage({ dir: "application", isImage: true, isDoc: false, fileSize: 5 });
const customerStorage = new Storage({ dir: "customers", isImage: true, isDoc: false, fileSize: 2 });
const serviceCategoryStorage = new Storage({ dir: "service-categories", isImage: true, isDoc: false, fileSize: 2 });
const serviceProviderStorage = new Storage({ dir: "service-provider", isImage: true, isDoc: true, fileSize: 5 });
const serviceProviderWorkPhotoStorage = new Storage({ dir: "service-provider-work", isImage: true, isDoc: false, fileSize: 2 });

router.use(requireAdminAuth);

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

// Profile
router.get("/profile", adminProfile);
router.put("/notifications/read-all", markAllAdminNotificationsRead);
router.put("/profile", validator("admin-profile"), updateAdminProfile);
router.put("/profile/password", validator("admin-profile-password"), updateAdminPassword);
router.put("/profile/image", adminStorage.single("image"), validator("admin-profile-image"), updateAdminProfileImage);
router.post("/logout", adminLogout);

// Settings
router.get("/settings", getSettings);
router.get("/settings/:type", getSettings);
router.put("/settings/:type", appSettingStorage.any(), validator("setting-update"), updateSettingsByType);

// Roles
router.post("/roles", validator("role"), createRole);
router.put("/roles/:id", validator("role"), updateRole);
router.delete("/roles/:id", deleteRole);
router.get("/roles/:id", getSingleRole);
router.get("/roles", getRole);
router.put("/roles/:id/permissions", addPermission);

// Sub Admins
router.get("/admins", listAdmins);
router.post("/admins", validator("admin"), createAdmin);
router.put("/admins/:id", validator("admin-update"), updateAdmin);
router.put("/admins/:id/permissions", addAdminPermission);
router.delete("/admins/:id", deleteAdmin);
router.get("/admins/:id", getSingleAdmin);

// Countries
router.post("/countries", validator("country"), createCountry);
router.put("/countries/:id", validator("country"), updateCountry);
router.delete("/countries/:id", deleteCountry);
router.get("/countries/:id", getSingleCountry);
router.get("/countries", getCountry);

// States
router.post("/states", validator("state"), createState);
router.put("/states/:id", validator("state"), updateState);
router.delete("/states/:id", deleteState);
router.get("/states/:id", getSingleState);
router.get("/states", getState);

// Cities
router.post("/cities", validator("city"), createCity);
router.put("/cities/:id", validator("city"), updateCity);
router.delete("/cities/:id", deleteCity);
router.get("/cities/:id", getSingleCity);
router.get("/cities", getCity);

// Customers
router.post("/customers", customerStorage.single("image"), validator("customer"), createCustomer);
router.put("/customers/:id", customerStorage.single("image"), validator("customer"), updateCustomer);
router.delete("/customers/:id", deleteCustomer);
router.get("/customers/:id", getSingleCustomer);
router.get("/customers", getCustomer);

// Service providers
router.post("/service-providers", serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]), validator("service-provider"), createServiceProvider);
router.put("/service-providers/:id", serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]), validator("service-provider"), updateServiceProvider);
router.put("/service-providers/:id/status", validator("service-provider-status"), updateServiceProviderStatus);
router.delete("/service-providers/:id", deleteServiceProvider);
router.get("/service-providers/:id", getSingleServiceProvider);
router.get("/service-providers", getServiceProvider);
router.get("/service-providers/:id/photos", getServiceProviderPhotos);
router.post("/service-providers/:id/photos", serviceProviderWorkPhotoStorage.array("photos", 20), uploadServiceProviderPhotos);
router.put("/service-providers/:id/photos/reorder", reorderServiceProviderPhotos);
router.delete("/service-providers/:id/photos/:photoId", deleteServiceProviderPhoto);

// Predefined rating tags
router.post("/rating-tags", validator("rating-tag"), createPredefinedRatingTag);
router.put("/rating-tags/:id", validator("rating-tag"), updatePredefinedRatingTag);
router.delete("/rating-tags/:id", deletePredefinedRatingTag);
router.get("/rating-tags/:id", getSinglePredefinedRatingTag);
router.get("/rating-tags", getPredefinedRatingTag);

// Service Categories
router.get("/service-categories/options", listServiceCategoriesForSelect);
router.post("/service-categories", serviceCategoryStorage.single("image"), validator("service-category"), createServiceCategory);
router.put("/service-categories/:id", serviceCategoryStorage.single("image"), validator("service-category"), updateServiceCategory);
router.delete("/service-categories/:id", deleteServiceCategory);
router.get("/service-categories/:id", getSingleServiceCategory);
router.get("/service-categories", getServiceCategory);

// Service types
router.post("/service-types", validator("service-type"), createServiceType);
router.put("/service-types/:id", validator("service-type"), updateServiceType);
router.delete("/service-types/:id", deleteServiceType);
router.get("/service-types/:id", getSingleServiceType);
router.get("/service-types", getServiceType);


export default router;
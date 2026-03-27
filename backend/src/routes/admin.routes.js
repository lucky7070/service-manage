import { Router } from "express";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import { validator } from "../libraries/validator.js";
import { adminLogout, adminProfile, updateAdminProfile, updateAdminProfileImage } from "../controller/admin/auth.controller.js";
import { getRole, createRole, updateRole, deleteRole, getSingleRole, addPermission } from "../controller/admin/role.controller.js";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, getSingleAdmin, addAdminPermission } from "../controller/admin/subAdmin.controller.js";
import { getSettings, updateSettingsByType } from "../controller/admin/setting.controller.js";
import { getCountry, createCountry, updateCountry, deleteCountry, getSingleCountry } from "../controller/admin/country.controller.js";
import { getState, createState, updateState, deleteState, getSingleState } from "../controller/admin/state.controller.js";
import { getCity, createCity, updateCity, deleteCity, getSingleCity } from "../controller/admin/city.controller.js";
import { getDashboardStats } from "../controller/admin/dashboard.controller.js";
import { Storage } from "../libraries/storage.js";

const router = Router();
const adminStorage = new Storage({ dir: "admins", isImage: true, isDoc: false, fileSize: 2 });
const appSettingStorage = new Storage({ dir: "application", isImage: true, isDoc: false, fileSize: 5 });

router.use(requireAdminAuth);

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

// Profile
router.get("/profile", adminProfile);
router.put("/profile", validator("admin-profile"), updateAdminProfile);
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


export default router;
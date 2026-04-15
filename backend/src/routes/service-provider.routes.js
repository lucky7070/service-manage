import { Router } from "express";
import { sendOtp, register, login, profile, getWorkPhotos, uploadWorkPhotos, deleteWorkPhoto, reorderWorkPhotos } from "../controller/service-provider.controller.js";
import { validator } from "../libraries/validator.js";
import { requireServiceProviderAuth } from "../middlewares/serviceProviderAuth.js";
import { Storage } from "../libraries/storage.js";

const router = Router();
const serviceProviderStorage = new Storage({ dir: "service-provider", isImage: true, isDoc: true, fileSize: 5 });
const serviceProviderWorkPhotoStorage = new Storage({ dir: "service-provider-work", isImage: true, isDoc: false, fileSize: 2 });

router.post("/send-otp", sendOtp);
router.post("/login", login);
router.post("/register", serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]), validator("service-provider-register"), register);

router.use(requireServiceProviderAuth);
router.get("/profile", profile);
router.get("/work-photos", getWorkPhotos);
router.post("/work-photos", serviceProviderWorkPhotoStorage.array("photos", 20), uploadWorkPhotos);
router.delete("/work-photos/:photoId", deleteWorkPhoto);
router.put("/work-photos/reorder", reorderWorkPhotos);

export default router;
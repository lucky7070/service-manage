import { Router } from "express";
import { sendOtp, register, login, profile } from "../controller/service-provider.controller.js";
import { validator } from "../libraries/validator.js";
import { requireServiceProviderAuth } from "../middlewares/serviceProviderAuth.js";
import { Storage } from "../libraries/storage.js";

const router = Router();
const serviceProviderStorage = new Storage({ dir: "service-provider", isImage: true, isDoc: true, fileSize: 5 });

router.post("/send-otp", sendOtp);
router.post("/login", login);
router.post("/register", serviceProviderStorage.fields([{ name: "image", maxCount: 1 }, { name: "panCardDocument", maxCount: 1 }, { name: "aadharDocument", maxCount: 1 }]), validator("service-provider-register"), register);

router.use(requireServiceProviderAuth);
router.get("/profile", profile);

export default router;
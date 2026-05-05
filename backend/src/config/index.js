import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: Number(process.env.PORT || 5000),
    mongoUri: String(process.env.MONGO_URI),
    jwtSecret: String(process.env.JWT_SECRET),
    customerJwtSecret: String(process.env.CUSTOMER_JWT_SECRET),
    serviceProviderJwtSecret: String(process.env.SERVICE_PROVIDER_JWT_SECRET),
    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
    frontendUrl: String(process.env.FRONTEND_URL || "").split(",").map((s) => s.trim()).filter(Boolean),
    isProduction: String(process.env.NODE_ENV || "development").toLowerCase() === "production",
    isDevelopment: String(process.env.NODE_ENV || "development").toLowerCase() === "development",
    crossOrigin: String(process.env.CROSS_ORIGIN_COOKIES || "false").toLowerCase() === "true",
    showError: String(process.env.SHOW_ERROR || "false").toLowerCase() === "true",
};

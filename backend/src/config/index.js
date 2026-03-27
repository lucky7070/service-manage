import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: Number(process.env.PORT || 5000),
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
    frontendUrl: process.env.FRONTEND_URL.split(","),
};

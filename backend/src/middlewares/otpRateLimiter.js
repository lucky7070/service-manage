import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const otpRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const mobile = String(req.body?.mobile || "").trim();
        if (mobile) return `otp:${mobile}`;
        
        return `otp:${ipKeyGenerator(req.ip)}`;
    },
    handler: (req, res) => {
        return res.status(429).json({
            status: false,
            message: "Too many OTP requests. Please try again after 1 minute.",
            data: []
        });
    }
});

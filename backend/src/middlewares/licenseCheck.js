import { config } from "../config/index.js";

export const licenseCheck = (request, response, next) => {
    const licenseKey = request.headers["x-api-key"];
    if (
        licenseKey === config.xApiKey
        || request.originalUrl.startsWith("/uploads/")
        || request.originalUrl.startsWith("/api/webhooks/")
    ) {
        next();
    } else {
        response.status(401).json({
            status: false,
            message: "Please provide valid x-api-key.",
            data: []
        });
    }
};

export default licenseCheck;

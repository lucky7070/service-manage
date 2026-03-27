export const licenseCheck = (request, response, next) => {
    const licenseKey = request.headers["x-api-key"];
    if (
        request.originalUrl.startsWith("/uploads/") ||
        request.originalUrl.startsWith("/api/settings/seed") ||
        request.originalUrl.startsWith("/health") ||
        licenseKey === process.env.X_API_KEY
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

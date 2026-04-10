const envConfig = {
    apiUrlAdmin: String(process.env.NEXT_PUBLIC_API_URL_ADMIN),
    apiUrl: String(process.env.NEXT_PUBLIC_API_URL),
    uploadUrl: String(process.env.NEXT_PUBLIC_UPLOAD_URL),
    apiLicence: String(process.env.NEXT_PUBLIC_API_LICENCE),
    logErrorsInConsole: Boolean(process.env.NEXT_PUBLIC_LOG_ERRORS_IN_CONSOLE === "true"),
    environment: String(process.env.NODE_ENV),
    socketUrl: String(process.env.NEXT_PUBLIC_SOCKET_URL),
};

export default envConfig;
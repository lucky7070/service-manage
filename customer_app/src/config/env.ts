const trim = (value: string | undefined) => String(value ?? "").trim();

const env = {
    apiUrl: trim(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, ""),
    uploadUrl: trim(process.env.EXPO_PUBLIC_UPLOAD_URL).replace(/\/$/, ""),
    socketUrl: trim(process.env.EXPO_PUBLIC_SOCKET_URL).replace(/\/$/, ""),
    webUrl: trim(process.env.EXPO_PUBLIC_WEB_URL).replace(/\/$/, ""),
    apiLicence: trim(process.env.EXPO_PUBLIC_API_LICENCE),
    logErrorsInConsole: trim(process.env.EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE) === "true",
};

export default env;

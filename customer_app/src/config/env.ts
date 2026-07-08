import Constants from "expo-constants";

const trim = (value: string | undefined) => String(value ?? "").trim();

type ExpoExtra = {
    appEnv?: string;
    apiUrl?: string;
    uploadUrl?: string;
    socketUrl?: string;
    webUrl?: string;
    apiLicence?: string;
    logErrorsInConsole?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

function readEnv(processKey: string, extraKey: keyof ExpoExtra): string {
    const fromBundler = trim(process.env[processKey]);
    if (fromBundler) return fromBundler;

    const fromExtra = extra[extraKey];
    if (typeof fromExtra === "boolean") return fromExtra ? "true" : "";
    return trim(typeof fromExtra === "string" ? fromExtra : String(fromExtra ?? ""));
}

const appEnv = (readEnv("EXPO_PUBLIC_APP_ENV", "appEnv") || "development").toLowerCase();
const env = {
    appEnv,
    isProduction: appEnv === "production",
    apiUrl: readEnv("EXPO_PUBLIC_API_URL", "apiUrl").replace(/\/$/, ""),
    uploadUrl: readEnv("EXPO_PUBLIC_UPLOAD_URL", "uploadUrl").replace(/\/$/, ""),
    socketUrl: readEnv("EXPO_PUBLIC_SOCKET_URL", "socketUrl").replace(/\/$/, ""),
    webUrl: readEnv("EXPO_PUBLIC_WEB_URL", "webUrl").replace(/\/$/, ""),
    apiLicence: readEnv("EXPO_PUBLIC_API_LICENCE", "apiLicence"),
    logErrorsInConsole: readEnv("EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE", "logErrorsInConsole") === "true" || extra.logErrorsInConsole === true,
};

export default env;
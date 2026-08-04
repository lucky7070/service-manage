/** @type {import('expo/config').ExpoConfig} */
const path = require("path");
const fs = require("fs");
const appJson = require("./app.json");
const trim = (value) => String(value ?? "").trim();

const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.EXPO_PUBLIC_APP_ENV === "production";

const googleServicesAndroidPath = path.join(__dirname, "google-services.json");
const googleServicesIosPath = path.join(__dirname, "GoogleService-Info.plist");
const hasGoogleServicesAndroid = fs.existsSync(googleServicesAndroidPath);
const hasGoogleServicesIos = fs.existsSync(googleServicesIosPath);

const android = {
    ...appJson.expo.android,
    usesCleartextTraffic: !isProduction,
};

if (hasGoogleServicesAndroid) {
    android.googleServicesFile = "./google-services.json";
}

const ios = {
    ...appJson.expo.ios,
};

if (hasGoogleServicesIos) {
    ios.googleServicesFile = "./GoogleService-Info.plist";
}

module.exports = {
    expo: {
        ...appJson.expo,
        android,
        ios,
        plugins: [
            ...(appJson.expo.plugins ?? []),
            "./plugins/withAndroidReleaseSigning",
        ],
        extra: {
            appEnv: trim(process.env.EXPO_PUBLIC_APP_ENV) || (isProduction ? "production" : "development"),
            apiUrl: trim(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, ""),
            uploadUrl: trim(process.env.EXPO_PUBLIC_UPLOAD_URL).replace(/\/$/, ""),
            socketUrl: trim(process.env.EXPO_PUBLIC_SOCKET_URL).replace(/\/$/, ""),
            webUrl: trim(process.env.EXPO_PUBLIC_WEB_URL).replace(/\/$/, ""),
            apiLicence: trim(process.env.EXPO_PUBLIC_API_LICENCE),
            logErrorsInConsole: trim(process.env.EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE) === "true",
            hasGoogleServices: hasGoogleServicesAndroid || hasGoogleServicesIos,
            hasGoogleServicesAndroid,
            hasGoogleServicesIos,
            eas: {
                projectId: "22c3af9a-0fcf-48e9-98a4-eb6662fd006e",
            },
        },
    },
};

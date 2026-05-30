/** @type {import('expo/config').ExpoConfig} */
const path = require("path");
const fs = require("fs");
const appJson = require("./app.json");

const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.EXPO_PUBLIC_APP_ENV === "production";

const googleServicesPath = path.join(__dirname, "google-services.json");
const hasGoogleServices = fs.existsSync(googleServicesPath);

const android = {
    ...appJson.expo.android,
    usesCleartextTraffic: !isProduction,
};

if (hasGoogleServices) {
    android.googleServicesFile = "./google-services.json";
}

module.exports = {
    expo: {
        ...appJson.expo,
        android,
        extra: {
            appEnv: isProduction ? "production" : "development",
            hasGoogleServices,
        },
    },
};

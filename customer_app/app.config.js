/** @type {import('expo/config').ExpoConfig} */
const appJson = require("./app.json");

const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.EXPO_PUBLIC_APP_ENV === "production";

module.exports = {
    expo: {
        ...appJson.expo,
        android: {
            ...appJson.expo.android,
            // Production should use HTTPS; allow HTTP only for local dev builds.
            usesCleartextTraffic: !isProduction,
        },
        extra: {
            appEnv: isProduction ? "production" : "development",
        },
    },
};

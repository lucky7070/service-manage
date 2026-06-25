import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const {
    applyAndroidReleaseSigningToBuildGradle,
    copyReleaseSigningGradle,
    assertAndroidReleaseSigningApplied,
} = require("../plugins/withAndroidReleaseSigning.js");

const projectRoot = process.cwd();
const buildGradlePath = join(projectRoot, "android", "app", "build.gradle");
const appJsonPath = join(projectRoot, "app.json");

if (!existsSync(buildGradlePath)) {
    console.error("[patch-android-signing] android/app/build.gradle not found. Run: npm run prebuild:prod");
    process.exit(1);
}

copyReleaseSigningGradle(projectRoot);

let content = readFileSync(buildGradlePath, "utf8");

const versionOptions = {};
if (existsSync(appJsonPath)) {
    const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));
    versionOptions.versionName = appJson.expo?.version ?? "1.0.0";
    versionOptions.versionCode = appJson.expo?.android?.versionCode ?? 1;
}

content = applyAndroidReleaseSigningToBuildGradle(content, versionOptions);
assertAndroidReleaseSigningApplied(content);

writeFileSync(buildGradlePath, content, "utf8");

if (versionOptions.versionCode != null) {
    console.log(
        `[patch-android-signing] Synced versionCode=${versionOptions.versionCode}, versionName=${versionOptions.versionName}`,
    );
}

const hasCredentials = existsSync(join(projectRoot, "credentials.json"));
const hasKeystore = existsSync(join(projectRoot, "credentials", "android", "keystore.jks"));

if (!hasCredentials || !hasKeystore) {
    console.warn("[patch-android-signing] WARNING: credentials.json or credentials/android/keystore.jks is missing.");
    console.warn("[patch-android-signing] Run: npx eas credentials → download production keystore");
    process.exit(1);
}

console.log("[patch-android-signing] Release signing uses credentials.json + credentials/android/keystore.jks");

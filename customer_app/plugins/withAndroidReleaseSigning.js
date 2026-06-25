const fs = require("fs");
const path = require("path");
const {
    withAppBuildGradle,
    withDangerousMod,
    createRunOncePlugin,
} = require("@expo/config-plugins");

const PLUGIN_NAME = "withAndroidReleaseSigning";
const APPLY_MARKER = "// SERVA_RELEASE_SIGNING_APPLY";
const APPLY_LINE = `${APPLY_MARKER}\napply from: "./serva-release-signing.gradle"`;

const SIGNING_CONFIGS_BLOCK = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def uploadKeystore = resolveUploadKeystore()
            if (uploadKeystore == null) {
                throw new GradleException(
                    'Release signing missing. Add credentials.json + credentials/android/keystore.jks (EAS export), or SERVA_UPLOAD_* in android/gradle.properties.'
                )
            }
            storeFile uploadKeystore.storeFile
            storePassword uploadKeystore.storePassword
            keyAlias uploadKeystore.keyAlias
            keyPassword uploadKeystore.keyPassword
        }
    }`;

function getSigningGradlePaths(projectRoot) {
    return {
        source: path.join(projectRoot, "gradle", "serva-release-signing.gradle"),
        dest: path.join(projectRoot, "android", "app", "serva-release-signing.gradle"),
    };
}

/** @param {string} projectRoot */
function copyReleaseSigningGradle(projectRoot) {
    const { source, dest } = getSigningGradlePaths(projectRoot);
    if (!fs.existsSync(source)) {
        throw new Error(`[${PLUGIN_NAME}] Missing ${source}`);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(source, dest);
}

/**
 * @param {string} content
 * @param {{ versionName?: string, versionCode?: number }} [options]
 */
function applyAndroidReleaseSigningToBuildGradle(content, options = {}) {
    let next = content.replace(/\r?\ndef resolveUploadKeystore = \{[\s\S]*?\r?\n\}\s*/g, "\n");

    if (!next.includes(APPLY_MARKER)) {
        const projectRootMatch = next.match(
            /def projectRoot = rootDir\.getAbsoluteFile\(\)\.getParentFile\(\)\.getAbsolutePath\(\)/,
        );
        if (!projectRootMatch) {
            throw new Error(
                `[${PLUGIN_NAME}] Could not find projectRoot in android/app/build.gradle`,
            );
        }
        next = next.replace(projectRootMatch[0], `${projectRootMatch[0]}\n\n${APPLY_LINE}`);
    }

    next = next.replace(
        /    signingConfigs \{[\s\S]*?    \}\r?\n    buildTypes \{/,
        `${SIGNING_CONFIGS_BLOCK}\n    buildTypes {`,
    );

    next = next.replace(
        /        release \{\r?\n            signingConfig signingConfigs\.debug/,
        "        release {\n            signingConfig signingConfigs.release",
    );

    next = next.replace(
        /        release \{\r?\n            \/\/ Caution![\s\S]*?\r?\n            signingConfig signingConfigs\.debug/,
        "        release {\n            signingConfig signingConfigs.release",
    );

    const { versionName, versionCode } = options;
    if (versionCode != null) {
        next = next.replace(/versionCode \d+/, `versionCode ${versionCode}`);
    }
    if (versionName) {
        next = next.replace(/versionName "[^"]*"/, `versionName "${versionName}"`);
    }

    return next;
}

function assertAndroidReleaseSigningApplied(content) {
    if (!content.includes(APPLY_MARKER)) {
        throw new Error(`[${PLUGIN_NAME}] apply from serva-release-signing.gradle was not added`);
    }
    if (!content.includes("signingConfig signingConfigs.release")) {
        throw new Error(`[${PLUGIN_NAME}] release buildType is not wired to signingConfigs.release`);
    }
    if (!content.includes("resolveUploadKeystore()")) {
        throw new Error(`[${PLUGIN_NAME}] release signingConfig is missing resolveUploadKeystore()`);
    }
}

/** @param {import('@expo/config-plugins').ExpoConfig} config */
function withAndroidReleaseSigning(config) {
    config = withDangerousMod(config, [
        "android",
        async (modConfig) => {
            copyReleaseSigningGradle(modConfig.modRequest.projectRoot);
            return modConfig;
        },
    ]);

    config = withAppBuildGradle(config, (gradleConfig) => {
        const expo = gradleConfig.modRequest?.projectConfig?.expo ?? config;
        gradleConfig.modResults.contents = applyAndroidReleaseSigningToBuildGradle(
            gradleConfig.modResults.contents,
            {
                versionName: expo.version,
                versionCode: expo.android?.versionCode,
            },
        );
        assertAndroidReleaseSigningApplied(gradleConfig.modResults.contents);
        return gradleConfig;
    });

    return config;
}

module.exports = createRunOncePlugin(withAndroidReleaseSigning, PLUGIN_NAME);
module.exports.applyAndroidReleaseSigningToBuildGradle = applyAndroidReleaseSigningToBuildGradle;
module.exports.copyReleaseSigningGradle = copyReleaseSigningGradle;
module.exports.assertAndroidReleaseSigningApplied = assertAndroidReleaseSigningApplied;

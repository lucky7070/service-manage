import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();

const pathsToRemove = [
    join(projectRoot, "android", "app", "build", "generated", "assets", "createBundleReleaseJsAndAssets"),
    join(projectRoot, "android", "app", "build", "generated", "res", "createBundleReleaseJsAndAssets"),
    join(projectRoot, "android", "app", "build", "intermediates", "sourcemaps", "react", "release"),
    join(projectRoot, "android", "app", "build", "intermediates", "assets", "release", "mergeReleaseAssets"),
];

let removed = 0;

for (const target of pathsToRemove) {
    if (!existsSync(target)) continue;
    rmSync(target, { recursive: true, force: true });
    removed += 1;
    console.log(`[refresh-android-release-bundle] removed ${target}`);
}

if (removed === 0) {
    console.log("[refresh-android-release-bundle] No cached release bundle found (fresh build will embed current env).");
} else {
    console.log(`[refresh-android-release-bundle] Cleared ${removed} cached path(s).`);
}

const {
  withInfoPlist,
  withAndroidManifest,
  withAppBuildGradle,
} = require("@expo/config-plugins");

/**
 * @param {import('@expo/config-plugins').ConfigPluginProps} config
 * @param {{ appId: string }} param1
 */
function withTikTokAppEvents(config, { appId }) {
  if (!appId) throw new Error("withTikTokAppEvents: appId is required");

  // iOS Info.plist
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.TTAppId = appId;
    return cfg;
  });

  // Android Manifest meta-data
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const application = manifest.manifest.application?.[0] ?? ({});
    application["meta-data"] = application["meta-data"] || [];
    const exists = application["meta-data"].some(
      (m) => m.$["android:name"] === "com.tiktok.sdk.AppId"
    );
    if (!exists) {
      application["meta-data"].push({
        $: {
          "android:name": "com.tiktok.sdk.AppId",
          "android:value": appId,
        },
      });
    }
    return cfg;
  });

  // Android build.gradle dependency
  config = withAppBuildGradle(config, (cfg) => {
    const dep =
      'implementation("com.tiktok.app-events.sdk:app-events-sdk:1.4.1")';
    if (!cfg.modResults.contents.includes(dep)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*{/,
        (match) => `${match}\n        ${dep}`
      );
    }
    return cfg;
  });

  return config;
}

module.exports = withTikTokAppEvents; 
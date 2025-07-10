import {
    ConfigPlugin,
    withAndroidManifest,
    withAppBuildGradle,
    withInfoPlist,
} from "@expo/config-plugins";

interface TikTokPluginProps {
  appId: string;
}

/**
 * Simple config-plugin that adds the TikTok App Events native SDK
 * (attribution only – no ads) to an Expo managed project.
 */
const withTikTokAppEvents: ConfigPlugin<TikTokPluginProps> = (
  config,
  { appId }
) => {
  if (!appId) {
    throw new Error("withTikTokAppEvents: appId is required");
  }

  // ────────── iOS (Info.plist) ──────────
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.TTAppId = appId;
    return cfg;
  });

  // ────────── Android Manifest meta-data ──────────
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const application =
      manifest.manifest.application?.[0] ?? ({} as any);

    application["meta-data"] = application["meta-data"] || [];

    const already = application["meta-data"].some(
      (m: any) => m.$["android:name"] === "com.tiktok.sdk.AppId"
    );

    if (!already) {
      application["meta-data"].push({
        $: {
          "android:name": "com.tiktok.sdk.AppId",
          "android:value": appId,
        },
      });
    }

    return cfg;
  });

  // ────────── Android build.gradle dependency ──────────
  config = withAppBuildGradle(config, (cfg) => {
    const dep = 'implementation("com.tiktok.app-events.sdk:app-events-sdk:1.4.1")';
    if (!cfg.modResults.contents.includes(dep)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*{/,
        (match: string) => `${match}\n        ${dep}`
      );
    }
    return cfg;
  });

  return config;
};

export default withTikTokAppEvents; 
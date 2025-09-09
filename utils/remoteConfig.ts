import {
  getRemoteConfig,
  fetchAndActivate as rcFetchAndActivate,
  getValue as rcGetValue,
  setConfigSettings as rcSetConfigSettings,
  setDefaults as rcSetDefaults,
} from "@react-native-firebase/remote-config";
// i18n-based overrides are handled via getCopyI18n per-key parameters

export async function initRemoteConfig() {
  try {
    const rc = getRemoteConfig();
    await rcSetDefaults(rc, {
      onboarding_attribution_options_json: JSON.stringify([
        "Kevin Liu",
        "DanielHowToGrow",
        "Mogg3d",
        "GoTallWithTaylor",
        "Height Wizard",
        "Other",
      ]),
      //go into remote config and set the new kew to change whatever you need.
    });

    await rcSetConfigSettings(rc, {
      minimumFetchIntervalMillis: __DEV__ ? 0 : 12 * 60 * 60 * 1000,
    });

    await fetchAndActivateRemoteConfig("app_start");
  } catch (error) {
    // Swallow RC errors; app should proceed with local defaults
    console.log("Remote Config init failed:", error);
  }
}

export function getJsonArrayParam(key: string, fallback: string[]): string[] {
  try {
    const rc = getRemoteConfig();
    const raw = rcGetValue(rc, key).asString();
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Coerce all entries to strings
      return parsed.map((v) => (typeof v === "string" ? v : String(v)));
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// Removed JSON-based copy; use i18n.t with per-key RC overrides via getCopyI18n

// Read copy value by i18n key (e.g., "onboarding:index_button_cta_text").
// Looks under language-scoped "$i18n" mapping. If not found, falls back to provided string.
export function getCopyI18n(i18nKey: string, fallback: string, lang?: string): string {
  try {
    // 1) Direct per-key Remote Config parameter (preferred for A/B tests)
    // Sanitize i18n key into a valid RC parameter name, e.g.,
    //   "onboarding:projection_button_unlock" -> "i18n_onboarding_projection_button_unlock"
    const rc = getRemoteConfig();
    const rcParamKey = `i18n_${i18nKey.replace(/[^A-Za-z0-9]/g, "_")}`;
    try {
      const directValue = rcGetValue(rc, rcParamKey).asString();
      if (typeof directValue === "string" && directValue.trim().length > 0) {
        return directValue;
      }
    } catch {}
  } catch {}
  return fallback;
}

// Fetch + activate with verbose logs so we can verify RC activity even when values don't change
export async function fetchAndActivateRemoteConfig(context?: string) {
  const rc = getRemoteConfig();
  const startMs = Date.now();
  try {
    console.log("[RC] fetch start", { context: context || "unspecified" });

    const activated = await rcFetchAndActivate(rc);

    console.log("[RC] fetch done", {
      context: context || "unspecified",
      activated,
      duration_ms: Date.now() - startMs,
    });
    return { activated } as const;
  } catch (error) {
    console.log("[RC] fetch error", { context: context || "unspecified", error });
    throw error;
  }
}



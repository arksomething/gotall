import {
  getRemoteConfig,
  fetchAndActivate as rcFetchAndActivate,
  getValue as rcGetValue,
  setConfigSettings as rcSetConfigSettings,
  setDefaults as rcSetDefaults,
} from "@react-native-firebase/remote-config";
import i18n from "./i18n";

export async function initRemoteConfig() {
  try {
    const rc = getRemoteConfig();
    await rcSetDefaults(rc, {
      onboarding_cta_text_en: "Let's start",
      // Server-driven copy (JSON). Structure:
      // {
      //   "en": {
      //     "onboarding": { "index": { "cta_label": "Let's start" } }
      //   }
      // }
      copy_json: JSON.stringify({
        en: { onboarding: { index: { cta_label: "Let's start" } } },
      }),
      // Optional: per-experiment or per-campaign overrides
      copy_overrides_json: "{}",
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

export function getStringParam(key: string, fallback: string): string {
  try {
    const rc = getRemoteConfig();
    const value = rcGetValue(rc, key).asString();
    return value || fallback;
  } catch {
    return fallback;
  }
}

// Cached parsed copy to avoid repeated JSON.parse operations
let cachedCopyObject: Record<string, any> | null = null;

function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) || Array.isArray(source)) {
    return source ?? target;
  }
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;
  const out: Record<string, any> = { ...target };
  for (const key of Object.keys(source)) {
    const t = (target as any)[key];
    const s = (source as any)[key];
    out[key] = deepMerge(t, s);
  }
  return out;
}

function getParsedCopyObject(): Record<string, any> {
  if (cachedCopyObject) return cachedCopyObject;
  try {
    const rc = getRemoteConfig();
    const rawBase = rcGetValue(rc, "copy_json").asString();
    const rawOverrides = rcGetValue(rc, "copy_overrides_json").asString();
    const base = rawBase ? JSON.parse(rawBase) : {};
    const overrides = rawOverrides ? JSON.parse(rawOverrides) : {};
    const merged = deepMerge(base && typeof base === "object" ? base : {}, overrides && typeof overrides === "object" ? overrides : {});
    cachedCopyObject = merged;
  } catch {
    cachedCopyObject = {};
  }
  return cachedCopyObject!;
}

function getCurrentLanguageCode(explicitLang?: string): string {
  // Prefer provided lang, then i18n language (base), then English
  if (explicitLang && typeof explicitLang === "string") return explicitLang;
  try {
    const lng = (i18n as any)?.language as string | undefined;
    if (lng) return lng.split("-")[0];
  } catch {}
  return "en";
}

function resolvePath<T = any>(root: Record<string, any>, path: string): T | undefined {
  const segments = path.split(".").filter(Boolean);
  let node: any = root;
  for (const seg of segments) {
    if (!node || typeof node !== "object" || !(seg in node)) return undefined;
    node = node[seg];
  }
  return node as T;
}

// Read copy value from Remote Config JSON by path and language. Falls back to provided string.
export function getCopy(path: string, fallback: string, lang?: string): string {
  try {
    const copyObj = getParsedCopyObject();
    const language = getCurrentLanguageCode(lang);
    const byLang = (copyObj?.[language] as Record<string, any>) || {};
    const value = resolvePath<string>(byLang, path);
    if (typeof value === "string" && value.trim().length > 0) return value;
  } catch {}
  return fallback;
}

// Read copy value by i18n key (e.g., "onboarding:index_button_cta_text").
// Looks under language-scoped "$i18n" mapping. If not found, falls back to provided string.
export function getCopyI18n(i18nKey: string, fallback: string, lang?: string): string {
  try {
    const copyObj = getParsedCopyObject();
    const language = getCurrentLanguageCode(lang);
    const byLang = (copyObj?.[language] as Record<string, any>) || {};
    const i18nBucket = (byLang?.$i18n as Record<string, any>) || {};
    const value = i18nBucket[i18nKey];
    if (typeof value === "string" && value.trim().length > 0) return value;
  } catch {}
  return fallback;
}

function snippet(input: string, max = 160): string {
  if (!input) return "";
  return input.length > max ? `${input.slice(0, max)}…` : input;
}

// Fetch + activate with verbose logs so we can verify RC activity even when values don't change
export async function fetchAndActivateRemoteConfig(context?: string) {
  const rc = getRemoteConfig();
  const startMs = Date.now();
  try {
    const beforeOverrides = rcGetValue(rc, "copy_overrides_json").asString();
    console.log("[RC] fetch start", {
      context: context || "unspecified",
      before_overrides_len: beforeOverrides?.length || 0,
      before_overrides_preview: snippet(beforeOverrides),
    });

    const activated = await rcFetchAndActivate(rc);

    // Clear local cache so next read re-parses any new values
    cachedCopyObject = null;

    const afterOverrides = rcGetValue(rc, "copy_overrides_json").asString();
    const changed = beforeOverrides !== afterOverrides;
    console.log("[RC] fetch done", {
      context: context || "unspecified",
      activated,
      changed,
      duration_ms: Date.now() - startMs,
      after_overrides_len: afterOverrides?.length || 0,
      after_overrides_preview: snippet(afterOverrides),
    });
    return { activated, changed } as const;
  } catch (error) {
    console.log("[RC] fetch error", { context: context || "unspecified", error });
    throw error;
  }
}



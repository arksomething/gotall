import i18n from "./i18n";
import { getCopyI18n } from "./remoteConfig";

let originalTranslate: ((key: string, options?: any) => any) | null = null;

// Direct helper for explicit usage
export function tRC(key: string, options?: any): string {
  const fallback = (i18n as any).t ? (i18n as any).t(key, options) : key;
  return getCopyI18n(key, typeof fallback === "string" ? fallback : String(fallback));
}

// Globally override i18n.t so all translations respect Remote Config overrides
export function enableGlobalCopyOverrides() {
  if (originalTranslate) return; // already enabled
  const baseT = (i18n as any).t?.bind(i18n);
  originalTranslate = baseT;
  (i18n as any).t = (key: string, options?: any) => {
    try {
      const fallback = baseT ? baseT(key, options) : key;
      return getCopyI18n(
        key,
        typeof fallback === "string" ? fallback : String(fallback)
      );
    } catch {
      return baseT ? baseT(key, options) : key;
    }
  };
}

export function disableGlobalCopyOverrides() {
  if (!originalTranslate) return;
  (i18n as any).t = originalTranslate;
  originalTranslate = null;
}



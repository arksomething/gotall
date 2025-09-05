import { crashlytics } from "./crashlytics";
import { logEvent as gaLogEvent, logScreenView, setUserId } from "./FirebaseAnalytics";

type LogParams = Record<string, any> | undefined;

class Logger {
  // Ensure Firebase event names are valid: 1-40 chars, alphanumeric or underscore
  // We keep original name for Crashlytics message, but sanitize for Analytics
  private sanitizeEventName(name: string): string {
    try {
      let result = (name || "").toLowerCase();
      // Replace invalid chars with underscore
      result = result.replace(/[^a-z0-9_]/gi, "_");
      // Collapse multiple underscores and trim
      result = result.replace(/_+/g, "_").replace(/^_+|_+$/g, "");
      // Must start with a letter; prefix if needed
      if (!/^[a-z]/.test(result)) {
        result = `e_${result}`;
      }
      // Enforce max length 40
      return result.slice(0, 40);
    } catch {
      return "event";
    }
  }

  trackScreen(screenName: string, options?: { group?: string; tab?: string; params?: LogParams }) {
    try {
      // Google Analytics (GA4)
      logScreenView(screenName);
      if (options?.group || options?.tab || options?.params) {
        gaLogEvent("screen_view_detail", {
          screen_name: screenName,
          screen_group: options?.group,
          tab: options?.tab,
          ...options?.params,
        });
      }

      // Crashlytics context
      crashlytics.setCustomKey("screen", screenName);
      if (options?.group) crashlytics.setCustomKey("screen_group", options.group);
      if (options?.tab) crashlytics.setCustomKey("current_tab", options.tab);
      crashlytics.logMessage(`SCREEN_VIEW: ${screenName} ${options?.group ? `(group: ${options.group})` : ""} ${options?.tab ? `(tab: ${options.tab})` : ""}`);
    } catch (error) {
      console.error("Logger.trackScreen error", error);
    }
  }

  trackTab(tabName: string) {
    try {
      gaLogEvent("tab_view", { tab: tabName });
      crashlytics.setCustomKey("current_tab", tabName);
      crashlytics.logMessage(`TAB_VIEW: ${tabName}`);
    } catch (error) {
      console.error("Logger.trackTab error", error);
    }
  }

  event(eventName: string, params?: LogParams) {
    try {
      const safeName = this.sanitizeEventName(eventName);
      gaLogEvent(safeName, params);
      crashlytics.logMessage(`EVENT: ${eventName} ${params ? JSON.stringify(params) : ""}`);
    } catch (error) {
      console.error("Logger.event error", error);
    }
  }

  // Simple duration tracker for sessions (e.g., lessons)
  private timers: Record<string, number> = {};

  startTimer(key: string, extra?: LogParams) {
    this.timers[key] = Date.now();
    if (extra) this.event(`${key}_start`, extra);
  }

  endTimer(key: string, extra?: LogParams) {
    const start = this.timers[key];
    const durationMs = start ? Date.now() - start : undefined;
    delete this.timers[key];
    this.event(`${key}_end`, { duration_ms: durationMs, ...extra });
    if (durationMs != null) {
      crashlytics.setCustomKey(`${key}_last_duration_ms`, durationMs);
    }
    return durationMs;
  }

  setUser(id: string) {
    try {
      setUserId(id);
      crashlytics.setUserIdentifier(id);
    } catch (error) {
      console.error("Logger.setUser error", error);
    }
  }
}

export const logger = new Logger();



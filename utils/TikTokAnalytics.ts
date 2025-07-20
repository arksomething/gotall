import Constants from "expo-constants";
import * as Device from "expo-device";
import { NativeModules, Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

// Prefer official RN bridge if present
import {
    TikTokBusiness
} from "react-native-tiktok-business-sdk";

// Prioritize the Business-SDK bridge, otherwise fall back to any previously linked modules.
const NativeTikTok: any = (TikTokBusiness as unknown) ||
  NativeModules.TTAppEvent ||
  NativeModules.TikTokAppEvents ||
  {};

// S2S config from app.json -> extra
const extra = (Constants?.expoConfig?.extra as any) || {};
const PIXEL_ID = extra?.tiktokPixelId;
const ACCESS_TOKEN = extra?.tiktokAccessToken;

// Unified endpoint (v1.3 consolidated)
const EVENTS_API_ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/app/events/";

let _initialized = false;
let _useEventsApiOnly = false;

export function initTikTok(appId: string, debug = false, fireLaunchEvent: boolean = true) {
  try {
    console.log("[TikTokAnalytics] Attempting to initialize with:", {
      appId,
      debug,
      availableModules: Object.keys(NativeModules),
      nativeTikTok: Object.keys(NativeTikTok),
      platform: Platform.OS
    });

    if (_initialized) return;

    if (NativeTikTok?.initializeSdk) {
      // New official bridge
      try {
        NativeTikTok.initializeSdk(
          appId,
          extra?.tiktokAppId ?? appId,
          debug
        );
      } catch (e) {
        console.error("[TikTokAnalytics] initializeSdk error", e);
        // Don't let TikTok SDK errors crash the app
        _useEventsApiOnly = !!(PIXEL_ID && ACCESS_TOKEN);
      }
    } else if (NativeTikTok?.init) {
      // Legacy community bridge
      try {
        NativeTikTok.init({ appId, debug });
      } catch (e) {
        console.error("[TikTokAnalytics] Legacy init error", e);
        _useEventsApiOnly = !!(PIXEL_ID && ACCESS_TOKEN);
      }
    } else {
      console.warn("[TikTokAnalytics] Native module not found - falling back to Events API");
      _useEventsApiOnly = !!(PIXEL_ID && ACCESS_TOKEN);
    }
    _initialized = true;

    // Automatically send an "app_launch" event once the SDK (or fallback) is ready
    if (fireLaunchEvent) {
      try {
        trackTikTok("app_launch");
      } catch (e) {
        console.error("[TikTokAnalytics] Failed to track app_launch event", e);
      }
    }
  } catch (error) {
    console.error("[TikTokAnalytics] Critical initialization error:", error);
    // Ensure the app doesn't crash due to TikTok analytics
    _initialized = true;
    _useEventsApiOnly = false;
  }
}

export function trackTikTok(eventName: string, params?: Record<string, any>) {
  if (!_initialized) return;

  if (!_useEventsApiOnly && (NativeTikTok?.trackEvent || NativeTikTok?.track)) {
    try {
      if (NativeTikTok.trackEvent) {
        // Prefer official SDK method
        NativeTikTok.trackEvent(eventName, params || {});
      } else {
        NativeTikTok.track(eventName, params || {});
      }
      console.log("[TikTokAnalytics] Successfully tracked event:", eventName);
    } catch (error) {
      console.error("[TikTokAnalytics] Failed to track event:", { eventName, error });
    }
  } else {
    if (_useEventsApiOnly) {
      sendEventViaApi(eventName, params || {});
    } else {
      console.warn("[TikTokAnalytics] track method not found on native module and Events API credentials missing");
    }
  }
}

async function sendEventViaApi(eventName: string, params: Record<string, any>) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[TikTokAnalytics] Missing Pixel ID or Access Token, cannot send S2S event");
    return;
  }

  try {
    const body = {
      pixel_code: PIXEL_ID,
      events: [
        {
          event: eventName,
          timestamp: Math.floor(Date.now() / 1000),
          event_id: uuidv4(),
          context: {
            device: {
              os: Platform.OS,
              os_version: Device.osVersion ?? "unknown",
              device_model: Device.modelName ?? "unknown",
            },
            app: {
              name: Constants.expoConfig?.name || "unknown",
              version: Constants.expoConfig?.version || "unknown",
            },
          },
          properties: params,
        },
      ],
    };

    const res = await fetch(EVENTS_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[TikTokAnalytics] Events API error", res.status, text);
    } else {
      console.log("[TikTokAnalytics] Event sent via S2S", eventName);
    }
  } catch (err) {
    console.error("[TikTokAnalytics] Failed S2S request", err);
  }
} 
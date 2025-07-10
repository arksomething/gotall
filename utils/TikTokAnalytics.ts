import { NativeModules } from "react-native";

const NativeTikTok: any = NativeModules.TTAppEvent || NativeModules.TikTokAppEvents || {};

let _initialized = false;

export function initTikTok(appId: string, debug = false) {
  if (_initialized) return;

  if (NativeTikTok?.init) {
    NativeTikTok.init({ appId, debug });
  } else {
    console.log("[TikTokAnalytics] init stub", { appId, debug });
  }
  _initialized = true;
}

export function trackTikTok(eventName: string, params?: Record<string, any>) {
  if (!_initialized) return;

  if (NativeTikTok?.track) {
    NativeTikTok.track(eventName, params || {});
  } else {
    console.log(`[TikTokAnalytics] track stub ${eventName}`, params);
  }
} 
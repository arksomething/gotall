import { logEvent as logFirebase } from "./FirebaseAnalytics";
import { trackTikTok } from "./TikTokAnalytics";

export function logEvent(name: string, params?: Record<string, any>) {
  // Send to Firebase
  logFirebase(name, params);
  // Send to TikTok if SDK initialised
  trackTikTok(name, params);
} 
// App configuration constants
export const CONFIG = {
  // Lesson lock duration in seconds (12 hours = 12 * 60 * 60 = 43200 seconds)
  LESSON_LOCK_DURATION_SECONDS: 43200,
  PUBERTY_TOTAL_STEPS: 11,
  PUBERTY_QUIZ_STEPS: 11,
  // Height update cooldown window in milliseconds
  // For testing, set to 1 minute; adjust to 7 days for production (7 * 24 * 60 * 60 * 1000)
  HEIGHT_UPDATE_COOLDOWN_MS: 60 * 1000,
} as const; 
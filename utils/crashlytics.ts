import { Platform } from 'react-native';

// Firebase Crashlytics integration
export class CrashlyticsService {
  private static instance: CrashlyticsService;
  private isInitialized = false;

  static getInstance(): CrashlyticsService {
    if (!CrashlyticsService.instance) {
      CrashlyticsService.instance = new CrashlyticsService();
    }
    return CrashlyticsService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Import Firebase Crashlytics dynamically to avoid issues in development
      if (__DEV__) {
        console.log('Crashlytics disabled in development mode');
        this.isInitialized = true;
        return;
      }

      // Initialize Firebase Crashlytics
      const crashlytics = await import('@react-native-firebase/crashlytics');
      await crashlytics.default().setCrashlyticsCollectionEnabled(true);
      
      console.log('Crashlytics initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Crashlytics:', error);
      this.isInitialized = true; // Mark as initialized to prevent retries
    }
  }

  logError(error: Error, context?: Record<string, any>) {
    try {
      console.error('Crashlytics log error:', {
        message: error.message,
        stack: error.stack,
        context,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });

      // Add to Crashlytics if available
      if (this.isInitialized && !__DEV__) {
        const crashlytics = require('@react-native-firebase/crashlytics');
        crashlytics.default().recordError(error);
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            crashlytics.default().setAttribute(key, String(value));
          });
        }
      }
    } catch (logError) {
      console.error('Failed to log error to Crashlytics:', logError);
    }
  }

  logMessage(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    try {
      console.log(`Crashlytics ${level}:`, message);

      // Add to Crashlytics if available
      if (this.isInitialized && !__DEV__) {
        const crashlytics = require('@react-native-firebase/crashlytics');
        crashlytics.default().log(`${level.toUpperCase()}: ${message}`);
      }
    } catch (logError) {
      console.error('Failed to log message to Crashlytics:', logError);
    }
  }

  setUserIdentifier(userId: string) {
    try {
      console.log('Crashlytics set user ID:', userId);

      // Add to Crashlytics if available
      if (this.isInitialized && !__DEV__) {
        const crashlytics = require('@react-native-firebase/crashlytics');
        crashlytics.default().setUserId(userId);
      }
    } catch (error) {
      console.error('Failed to set user ID in Crashlytics:', error);
    }
  }

  setCustomKey(key: string, value: string | number | boolean) {
    try {
      console.log('Crashlytics set custom key:', { key, value });

      // Add to Crashlytics if available
      if (this.isInitialized && !__DEV__) {
        const crashlytics = require('@react-native-firebase/crashlytics');
        crashlytics.default().setAttribute(key, String(value));
      }
    } catch (error) {
      console.error('Failed to set custom key in Crashlytics:', error);
    }
  }
}

export const crashlytics = CrashlyticsService.getInstance(); 
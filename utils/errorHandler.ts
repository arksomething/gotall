import { Alert } from 'react-native';
import { crashlytics } from './crashlytics';

// Global error handler for unhandled JavaScript errors
export function setupGlobalErrorHandler() {
  const originalErrorHandler = ErrorUtils.setGlobalHandler;
  
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error('Global error handler caught:', {
      error: error.message,
      stack: error.stack,
      isFatal,
      timestamp: new Date().toISOString(),
    });

    // Log to Crashlytics
    try {
      crashlytics.logError(error, {
        isFatal,
        errorType: 'global_error',
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log global error:', logError);
    }

    // For fatal errors, show a user-friendly message
    if (isFatal) {
      Alert.alert(
        'App Error',
        'The app encountered an unexpected error. Please restart the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              // You could restart the app here if needed
              console.log('User acknowledged fatal error');
            },
          },
        ]
      );
    }

    // Call the original handler if it exists
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

// Handle unhandled promise rejections
export function setupUnhandledPromiseRejectionHandler() {
  const originalHandler = global.ErrorUtils?.setGlobalHandler;
  
  if (originalHandler) {
    originalHandler((error: Error, isFatal?: boolean) => {
      console.error('Unhandled promise rejection:', {
        error: error.message,
        stack: error.stack,
        isFatal,
        timestamp: new Date().toISOString(),
      });

      // Log to Crashlytics
      try {
        crashlytics.logError(error, {
          isFatal,
          errorType: 'unhandled_promise_rejection',
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Failed to log unhandled promise rejection:', logError);
      }

      // Don't crash the app for promise rejections
      if (isFatal) {
        console.warn('Preventing app crash from unhandled promise rejection');
        return;
      }
    });
  }
}

// Initialize all error handlers
export function initializeErrorHandling() {
  setupGlobalErrorHandler();
  setupUnhandledPromiseRejectionHandler();
  
  console.log('Global error handling initialized');
} 
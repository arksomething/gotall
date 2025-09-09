import {
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperty as firebaseSetUserProperty,
  getAnalytics,
} from '@react-native-firebase/analytics';

// Obtain the analytics instance once
const analyticsInstance = getAnalytics();

export async function logEvent(eventName: string, params?: { [key: string]: any }) {
  try {
    if (__DEV__) {
      // Surface analytics calls in the Metro console for easy debugging
      // Note: This does not guarantee delivery to GA; it confirms the app attempted to log the event.
      // eslint-disable-next-line no-console
      console.log("[GA] logEvent", eventName, params || {});
    }
    await firebaseLogEvent(analyticsInstance, eventName, params);
  } catch (error) {
    console.warn('Failed to log analytics event', eventName, error);
  }
}

export async function setUserId(id: string) {
  try {
    await firebaseSetUserId(analyticsInstance, id);
  } catch (error) {
    console.warn('Failed to set user ID for analytics', error);
  }
}

export async function logScreenView(screenName: string) {
  await logEvent('screen_view', {
    screen_name: screenName,
    screen_class: screenName,
  });
} 

export async function setUserProperty(name: string, value: string | null) {
  try {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[GA] setUserProperty", { name, value });
    }
    await firebaseSetUserProperty(analyticsInstance, name, value);
  } catch (error) {
    console.warn('Failed to set user property', name, error);
  }
}
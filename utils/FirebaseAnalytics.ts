import {
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  getAnalytics,
} from '@react-native-firebase/analytics';

// Obtain the analytics instance once
const analyticsInstance = getAnalytics();

export async function logEvent(eventName: string, params?: { [key: string]: any }) {
  try {
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
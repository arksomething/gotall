import { Platform } from 'react-native';

export interface ProductConfig {
  id: string;
  title: string;
  description: string;
}

// Define all product configurations
export const PRODUCTS: Record<string, ProductConfig> = {
  LIFETIME: {
    id: "gotall.perm.access.nonc",
    title: "Permanent Access",
    description: "Get unlimited access to all features forever, including height tracking, posture reminders, and fitness goals. Great value!"
  },
  WEEKLY: {
    id: "gotall.weekly.access.nonc",
    title: "Weekly Access",
    description: "Get temporary access to all features, billed weekly. Includes height tracking, posture reminders, and fitness goals. Great to test the app!"
  }
};

// Define all in-app product IDs you want to offer
export const PRODUCT_IDS: string[] = Platform.select({
  ios: [
    PRODUCTS.LIFETIME.id, // Lifetime
    PRODUCTS.WEEKLY.id,   // Weekly
  ],
  android: [
    PRODUCTS.LIFETIME.id,
    PRODUCTS.WEEKLY.id,
  ],
  default: [PRODUCTS.LIFETIME.id],
}) as string[]; 
import { useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';

export interface ProductConfig {
  id: string;
  title: string;
  description: string;
}

export interface SubscriptionProduct {
  identifier: string;
  title?: string;
  price?: string;
  priceString?: string;
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

// RevenueCat manages product IDs via offerings; no direct list needed here

interface UseIAPResult {
  products: SubscriptionProduct[];
  isPurchasing: boolean;
  error: string | null;
}

export function useIAP(): UseIAPResult {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [isPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFromOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        const packages = current?.availablePackages || [];
        const formatted = packages.map((pkg: any) => ({
          identifier: pkg?.product?.identifier,
          title: pkg?.product?.title,
          price: pkg?.product?.price,
          priceString: pkg?.product?.priceString,
        }));
        setProducts(formatted);
      } catch (e: any) {
        console.warn('Failed to load offerings', e);
        setError('Failed to load product details');
      }
    };

    loadFromOfferings();
  }, []);

  // RevenueCat handles purchases via Paywalls/UI; no imperative purchase helpers here

  return {
    products,
    isPurchasing,
    error
  };
} 
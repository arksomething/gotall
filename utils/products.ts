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
    id: "gotall.lifetime.access.nonc",
    title: "Lifetime Access",
    description: "One-time purchase. Unlimited access to all features forever."
  },
  WEEKLY: {
    id: "gotall.weekly.access.nonc",
    title: "Weekly Access",
    description: "Full access billed weekly. Great for trying the app."
  },
  YEARLY: {
    id: "gotall.yearly.access.nonc",
    title: "Yearly Access",
    description: "Best value annual plan with full access."
  },
  PERMANENT: {
    id: "gotall.perm.access.nonc",
    title: "Permanent Access",
    description: "Permanent access entitlement (alternate lifetime SKU)."
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
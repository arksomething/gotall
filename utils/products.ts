import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  acknowledgePurchaseAndroid,
  finishTransaction,
  getAvailablePurchases as getIAPPurchases,
  getProducts,
  getSubscriptions,
  initConnection,
  Product,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
  SubscriptionAndroid,
  SubscriptionOfferAndroid
} from 'react-native-iap';

export interface ProductConfig {
  id: string;
  title: string;
  description: string;
}

export interface SubscriptionProduct extends Omit<Product, 'type'> {
  type: 'inapp' | 'iap' | 'subscription';
  subscriptionOfferDetails?: SubscriptionOfferAndroid[];
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

interface UseIAPResult {
  products: SubscriptionProduct[];
  isPurchasing: boolean;
  error: string | null;
  handlePurchase: (productId: string) => Promise<void>;
  handleRestore: () => Promise<boolean>;
  checkAvailablePurchases: () => Promise<any[]>;
}

export function useIAP(): UseIAPResult {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Starting IAP initialization...");
        const connected = await initConnection();
        console.log("IAP connection initialized:", { connected });

        if (Platform.OS === 'android') {
          // Android-specific initialization
          const subscriptionIds = PRODUCT_IDS.filter(id => id.includes('weekly'));
          const oneTimeIds = PRODUCT_IDS.filter(id => !id.includes('weekly'));

          const [subscriptions, oneTimeProducts] = await Promise.all([
            getSubscriptions({ skus: subscriptionIds }),
            getProducts({ skus: oneTimeIds })
          ]);

          // Format Android subscriptions
          const formattedSubscriptions = subscriptions.map(sub => {
            const androidSub = sub as SubscriptionAndroid;
            const offerDetails = androidSub.subscriptionOfferDetails?.[0];
            const pricingPhase = offerDetails?.pricingPhases?.pricingPhaseList?.[0];
            return {
              ...androidSub,
              type: 'subscription' as const,
              price: pricingPhase?.formattedPrice || '0',
              currency: 'USD',
              localizedPrice: pricingPhase?.formattedPrice || '$0'
            } as SubscriptionProduct;
          });

          // Format Android one-time products
          const formattedProducts = oneTimeProducts.map(p => ({
            ...p,
            type: 'inapp' as const
          })) as SubscriptionProduct[];

          const allProducts = [...formattedSubscriptions, ...formattedProducts];

          if (allProducts.length > 0) {
            const sorted = allProducts.sort((a, b) => {
              if (a.productId.includes("weekly")) return -1;
              if (b.productId.includes("weekly")) return 1;
              return 0;
            });
            setProducts(sorted);
          } else {
            console.log("No Android products available");
            setError("Products not available");
          }
        } else {
          // iOS-specific initialization
          const allProducts = await getProducts({ skus: PRODUCT_IDS });
          
          if (allProducts.length > 0) {
            const formattedProducts = allProducts.map(p => ({
              ...p,
              type: p.productId.includes('weekly') ? 'subscription' : 'inapp'
            })) as SubscriptionProduct[];

            const sorted = formattedProducts.sort((a, b) => {
              if (a.productId.includes("weekly")) return -1;
              if (b.productId.includes("weekly")) return 1;
              return 0;
            });
            setProducts(sorted);
          } else {
            console.log("No iOS products available");
            setError("Products not available");
          }
        }
      } catch (e: any) {
        console.warn("Failed to load products:", e);
        setError("Failed to load product details");
      }
    };

    initialize();
  }, []);

  const handlePurchase = async (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (!product) {
      setError("Product not found");
      return;
    }

    try {
      setIsPurchasing(true);
      setError(null);

      if (Platform.OS === 'android') {
        const hasSubscriptionOffer = product.subscriptionOfferDetails && 
                                   product.subscriptionOfferDetails.length > 0 && 
                                   product.subscriptionOfferDetails[0].offerToken;

        if (hasSubscriptionOffer && product.subscriptionOfferDetails) {
          await requestSubscription({
            sku: product.productId,
            subscriptionOffers: [{
              sku: product.productId,
              offerToken: product.subscriptionOfferDetails[0].offerToken
            }]
          });
        } else {
          await requestPurchase({
            skus: [product.productId]
          });
        }
      } else {
        // iOS purchase handling
        await requestPurchase({
          sku: product.productId
        });
      }
    } catch (e) {
      console.warn("Purchase failed", e);
      setError("Failed to start purchase");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async (): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      setError(null);
      const purchases = await getIAPPurchases();

      if (Platform.OS === "android") {
        // Android-specific restore handling
        for (const purchase of purchases) {
          if (purchase.purchaseToken) {
            try {
              await acknowledgePurchaseAndroid({
                token: purchase.purchaseToken,
              });
            } catch (ackError) {
              console.warn("Error acknowledging restored purchase:", ackError);
            }
          }
        }
      } else {
        // iOS-specific restore handling
        for (const purchase of purchases) {
          if (purchase.transactionReceipt) {
            await finishTransaction({
              purchase,
              isConsumable: false,
            });
          }
        }
      }

      return purchases && purchases.length > 0;
    } catch (e) {
      console.warn("Restore failed", e);
      setError("Failed to restore purchases");
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  // Set up purchase listeners
  useEffect(() => {
    const purchaseUpdate = purchaseUpdatedListener(async (purchase) => {
      try {
        if (Platform.OS === "android" && purchase.purchaseToken) {
          await acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
        }
        await finishTransaction({ purchase, isConsumable: false });
      } catch (error) {
        console.error("Error processing purchase:", error);
      }
    });

    const purchaseError = purchaseErrorListener((error: PurchaseError) => {
      console.error("Purchase error:", error);
      setError("Failed to complete purchase");
    });

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
    };
  }, []);

  const checkAvailablePurchases = async (): Promise<any[]> => {
    try {
      return await getIAPPurchases();
    } catch (e) {
      console.warn("Failed to get available purchases:", e);
      setError("Failed to get available purchases");
      return [];
    }
  };

  return {
    products,
    isPurchasing,
    error,
    handlePurchase,
    handleRestore,
    checkAvailablePurchases
  };
} 
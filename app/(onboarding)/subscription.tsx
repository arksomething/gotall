import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  acknowledgePurchaseAndroid,
  finishTransaction,
  getAvailablePurchases,
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
  SubscriptionOfferAndroid,
} from "react-native-iap";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useUserData } from "../../utils/UserContext";
import { calculateHeightProjection } from "../../utils/heightProjection";
import { PRODUCT_IDS, PRODUCTS } from "../../utils/products";

interface SubscriptionProduct extends Omit<Product, "type"> {
  type: "inapp" | "iap" | "subscription";
  subscriptionOfferDetails?: SubscriptionOfferAndroid[];
}

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heightDifference, setHeightDifference] = useState(2); // Default to 2 inches

  useEffect(() => {
    // Calculate actual height difference
    if (userData?.heightCm) {
      try {
        const projectionData = calculateHeightProjection({
          heightCm: userData.heightCm,
          age: getAge(),
          sex: userData.sex,
          motherHeightCm: userData.motherHeightCm,
          fatherHeightCm: userData.fatherHeightCm,
        });

        // Convert heights to total inches for comparison
        const [potentialFeet, potentialInches] = projectionData.potentialHeight
          .split("'")
          .map((v) => parseFloat(v));
        const [actualFeet, actualInches] = projectionData.actualHeight
          .split("'")
          .map((v) => parseFloat(v));

        const potentialTotalInches = potentialFeet * 12 + potentialInches;
        const actualTotalInches = actualFeet * 12 + actualInches;

        // Calculate difference and round to nearest whole number
        const difference = Math.round(potentialTotalInches - actualTotalInches);
        setHeightDifference(difference);
      } catch (error) {
        console.error("Error calculating height difference:", error);
      }
    }
  }, [userData, getAge]);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Starting IAP initialization...");
        const connected = await initConnection();
        console.log("IAP connection initialized:", { connected });

        // Split product IDs into subscriptions and one-time purchases
        const subscriptionIds = PRODUCT_IDS.filter((id) =>
          id.includes("weekly")
        );
        const oneTimeIds = PRODUCT_IDS.filter((id) => !id.includes("weekly"));

        console.log("Requesting products:", {
          subscriptionIds,
          oneTimeIds,
          platform: Platform.OS,
        });

        // Fetch both types of products
        const [subscriptions, products] = await Promise.all([
          getSubscriptions({ skus: subscriptionIds }),
          getProducts({ skus: oneTimeIds }),
        ]);

        console.log("Subscriptions fetched:", {
          count: subscriptions.length,
          details: subscriptions.map((sub) => ({
            productId: sub.productId,
            title: sub.title,
            ...(Platform.OS === "android"
              ? {
                  subscriptionOfferDetails: (sub as SubscriptionAndroid)
                    .subscriptionOfferDetails,
                }
              : {}),
          })),
        });

        console.log("Products fetched:", {
          count: products.length,
          details: products.map((p) => ({
            productId: p.productId,
            title: p.title,
            price: p.price,
          })),
        });

        // Convert subscriptions to SubscriptionProduct format
        const formattedSubscriptions = subscriptions.map((sub) => {
          if (Platform.OS === "android") {
            const androidSub = sub as SubscriptionAndroid;
            const offerDetails = androidSub.subscriptionOfferDetails?.[0];
            const pricingPhase =
              offerDetails?.pricingPhases?.pricingPhaseList?.[0];
            return {
              ...androidSub,
              type: "subscription" as const,
              price: pricingPhase?.formattedPrice || "0",
              currency: "USD",
              localizedPrice: pricingPhase?.formattedPrice || "$0",
            } as SubscriptionProduct;
          } else {
            return {
              ...sub,
              type: "subscription" as const,
              price: (sub as any).price || "0",
              currency: "USD",
              localizedPrice: (sub as any).localizedPrice || "$0",
            } as SubscriptionProduct;
          }
        });

        const formattedProducts = products.map((p) => ({
          ...p,
          type: "inapp" as const,
        })) as SubscriptionProduct[];

        const allProducts = [...formattedSubscriptions, ...formattedProducts];

        if (allProducts.length > 0) {
          // Sort to put weekly access first
          const sorted = allProducts.sort((a, b) => {
            if (a.productId.includes("weekly")) return -1;
            if (b.productId.includes("weekly")) return 1;
            return 0;
          });
          setProducts(sorted);
          setSelectedIndex(0); // weekly will be first now
        } else {
          console.log("No products were returned. Debug info:", {
            platform: Platform.OS,
            subscriptionIds,
            oneTimeIds,
          });
          setError("Products not available");
        }
      } catch (e: any) {
        console.warn("Failed to load products:", {
          error: e,
          code: e.code,
          message: e.message,
          stack: e.stack,
          platform: Platform.OS,
          productIds: PRODUCT_IDS,
        });
        setError("Failed to load product details");
      }
    };

    initialize();
  }, []);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      setError(null);
      const purchases = await getAvailablePurchases();
      console.log(
        "Available purchases during restore:",
        JSON.stringify(purchases, null, 2)
      );

      // Try to acknowledge any unacknowledged purchases on Android
      if (Platform.OS === "android") {
        for (const purchase of purchases) {
          // On Android, if purchaseToken exists, we should acknowledge it
          if (purchase.purchaseToken) {
            try {
              await acknowledgePurchaseAndroid({
                token: purchase.purchaseToken,
              });
              console.log(
                "Acknowledged restored purchase:",
                purchase.productId
              );
            } catch (ackError) {
              console.warn("Error acknowledging restored purchase:", ackError);
            }
          }
        }
      }

      // Check if there are any valid purchases
      if (purchases && purchases.length > 0) {
        await AsyncStorage.setItem("@onboarding_completed", "true");
        router.replace("/(tabs)");
      } else {
        setError("No active purchases found to restore.");
      }
    } catch (e) {
      console.warn("Restore failed", e);
      setError("Failed to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePurchase = async () => {
    if (selectedIndex === null || !products[selectedIndex]) return;
    const product = products[selectedIndex];

    try {
      setIsPurchasing(true);
      setError(null);

      console.log("Attempting purchase with product:", {
        productId: product.productId,
        title: product.title,
        platform: Platform.OS,
        subscriptionOfferDetails: product.subscriptionOfferDetails,
      });

      const hasSubscriptionOffer =
        product.subscriptionOfferDetails &&
        product.subscriptionOfferDetails.length > 0 &&
        product.subscriptionOfferDetails[0].offerToken;

      if (
        Platform.OS === "android" &&
        hasSubscriptionOffer &&
        product.subscriptionOfferDetails
      ) {
        // For Android subscriptions, we need to use the offer token
        await requestSubscription({
          sku: product.productId,
          subscriptionOffers: [
            {
              sku: product.productId,
              offerToken: product.subscriptionOfferDetails[0].offerToken,
            },
          ],
        });
      } else {
        // For one-time purchases or iOS
        await requestPurchase({
          sku: product.productId,
        });
      }

      // Set up purchase listener
      const purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase) => {
          console.log("Purchase updated:", purchase);

          try {
            if (Platform.OS === "android") {
              // Acknowledge the purchase on Android
              if (purchase.purchaseToken) {
                await acknowledgePurchaseAndroid({
                  token: purchase.purchaseToken,
                });
                console.log("Purchase acknowledged on Android");
              }
            } else if (Platform.OS === "ios") {
              // Finish the transaction on iOS
              const receipt = purchase.transactionReceipt;
              if (receipt && purchase.transactionId) {
                await finishTransaction({
                  purchase,
                  isConsumable: false,
                });
                console.log("Transaction finished on iOS");
              }
            }

            // Complete the transaction
            await finishTransaction({ purchase, isConsumable: false });

            // Mark onboarding as complete and navigate
            await AsyncStorage.setItem("@onboarding_completed", "true");
            router.replace("/(tabs)");
          } catch (error) {
            console.error("Error processing purchase:", error);
            setError("Failed to process purchase. Please try again.");
          }
        }
      );

      const purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          console.error("Purchase error:", error);
          setError(
            "Failed to complete purchase. Please check your payment method and try again."
          );
        }
      );

      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
      };
    } catch (e) {
      console.warn("Purchase failed", e);
      setError("Failed to start purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <OnboardingLayout
      title={`We've generated a plan for you to optimize for ${heightDifference} extra ${
        heightDifference === 1 ? "inch" : "inches"
      }`}
      currentStep={7}
      showBackButton={true}
      onBack={onBack}
      onNext={handlePurchase}
      nextButtonText={isPurchasing ? "Processing..." : "Unlock Now"}
      disableDefaultNext={isPurchasing || isRestoring || selectedIndex === null}
    >
      <View style={styles.container}>
        <View style={styles.generatingBox}>
          <Image
            source={require("../../assets/images/image.png")}
            style={styles.generatingImage}
            resizeMode="contain"
            blurRadius={5}
          />
        </View>

        <View style={styles.subscriptionSection}>
          {error && (
            <Text style={[styles.subscriptionText, styles.errorText]}>
              {error}
            </Text>
          )}

          {products.length === 0 && !error && (
            <Text style={styles.subscriptionText}>
              Loading product details...
            </Text>
          )}

          <Text style={styles.headerText}>Get access to the full app now!</Text>

          {products.map((p, idx) => (
            <TouchableOpacity
              key={p.productId}
              style={[
                styles.optionButton,
                selectedIndex === idx && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedIndex(idx)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedIndex === idx && styles.optionTextSelected,
                ]}
              >
                {p.title.replace(/ \(.*\)$/, "")} – {p.localizedPrice}
              </Text>
              <Text style={styles.descriptionText}>
                {
                  PRODUCTS[
                    p.productId === PRODUCTS.LIFETIME.id ? "LIFETIME" : "WEEKLY"
                  ].description
                }
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            <Text style={styles.restoreText}>
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    marginBottom: 16,
  },
  generatingBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  generatingImage: {
    width: "100%",
    height: "100%",
  },
  subscriptionSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  subscriptionText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    width: "100%",
    marginBottom: 24,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9ACD32",
  },
  descriptionText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "left",
    marginTop: 4,
  },
  errorText: {
    color: "#ff6b6b",
  },
  restoreButton: {
    marginTop: 20,
    padding: 10,
  },
  restoreText: {
    color: "#9ACD32",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  optionButton: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 10,
    marginTop: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#9ACD3233",
  },
  optionText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "left",
    marginBottom: 4,
  },
  optionTextSelected: {
    color: "#9ACD32",
  },
});

export default withOnboarding(SubscriptionScreen, 8, "subscription");

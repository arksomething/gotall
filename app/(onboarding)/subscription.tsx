import * as InAppPurchases from "expo-in-app-purchases";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";

const LIFETIME_ACCESS_ID = Platform.select({
  ios: "gotall.lifetime.access",
  android: "gotall.lifetime.access",
  default: "gotall.lifetime.access",
});

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);

  React.useEffect(() => {
    InAppPurchases.connectAsync();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handlePurchase = async () => {
    if (!LIFETIME_ACCESS_ID) {
      Alert.alert("Error", "Product ID not configured for this platform");
      return;
    }

    try {
      setIsPurchasing(true);

      const { responseCode, results } = await InAppPurchases.getProductsAsync([
        LIFETIME_ACCESS_ID,
      ]);

      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        throw new Error("Failed to get product information");
      }

      if (!results || results.length === 0) {
        throw new Error("Product not found");
      }

      // Start the purchase
      await InAppPurchases.purchaseItemAsync(LIFETIME_ACCESS_ID);

      // Listen for purchase updates
      InAppPurchases.setPurchaseListener(
        ({ responseCode, results: purchaseResults }) => {
          if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            setIsPurchasing(false);
            return;
          }

          if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
            setIsPurchasing(false);
            Alert.alert(
              "Error",
              "There was an error processing your purchase. Please try again.",
              [{ text: "OK" }]
            );
            return;
          }

          // Purchase was successful
          Alert.alert(
            "Success!",
            "Your lifetime access has been activated. Welcome to the family!",
            [
              {
                text: "Get Started",
                onPress: () => {
                  // Remove the purchase listener before navigation
                  InAppPurchases.setPurchaseListener(() => {});
                  router.replace("/(tabs)");
                },
              },
            ]
          );
          setIsPurchasing(false);
        }
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an error processing your purchase. Please try again.",
        [{ text: "OK" }]
      );
      console.error("Purchase error:", error);
      setIsPurchasing(false);
    }
  };

  return (
    <OnboardingLayout
      title="We've generated a plan for you to optimize for 4 extra inches"
      currentStep={8}
      showBackButton={true}
      onBack={onBack}
      onNext={handlePurchase}
      nextButtonText={isPurchasing ? "Processing..." : "Continue"}
      disableDefaultNext={isPurchasing}
    >
      <View style={styles.container}>
        <View style={styles.generatingBox}>
          <Text style={styles.generatingText}>
            Something showing it generating tasks but the shit is blurred
          </Text>
        </View>

        <View style={styles.subscriptionSection}>
          <Text style={styles.subscriptionText}>
            Do you wish to proceed with a lifetime access for{" "}
            <Text style={styles.priceText}>$9.99</Text>?
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  generatingBox: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#0088ff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  generatingText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  subscriptionSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  subscriptionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  priceText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default withOnboarding(SubscriptionScreen, 8, "subscription");

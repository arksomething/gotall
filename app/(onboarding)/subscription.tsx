import * as InAppPurchases from "expo-in-app-purchases";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";

const LIFETIME_ACCESS_ID = Platform.select({
  ios: "gotall.lifetime.access.nonc",
  android: "gotall.lifetime.access.nonc",
  default: "gotall.lifetime.access.nonc",
});

const productIds = Platform.select({
  ios: [LIFETIME_ACCESS_ID],
  android: [LIFETIME_ACCESS_ID],
  default: [LIFETIME_ACCESS_ID],
});

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isStoreConnected, setIsStoreConnected] = useState(false);
  const [products, setProducts] = useState<InAppPurchases.IAPItemDetails[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await InAppPurchases.connectAsync();
        setIsStoreConnected(true);

        const { responseCode, results } = await InAppPurchases.getProductsAsync(
          productIds
        );

        if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
          setProducts(results);
        }
      } catch (e) {
        console.warn("Error connecting to store", e);
      }
    };

    init();

    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handlePurchase = async () => {
    if (product) {
      try {
        setIsPurchasing(true);
        await InAppPurchases.purchaseItemAsync(product.productId);
      } catch (e) {
        console.warn("Error making purchase", e);
        setIsPurchasing(false);
      }
    }
  };

  const product = products[0];

  return (
    <OnboardingLayout
      title="We've generated a plan for you to optimize for 4 extra inches"
      currentStep={8}
      showBackButton={true}
      onBack={onBack}
      onNext={handlePurchase}
      nextButtonText={isPurchasing ? "Processing..." : "Continue"}
      disableDefaultNext={isPurchasing || !isStoreConnected || !product}
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
          <Text style={styles.subscriptionText}>
            Do you wish to proceed with a lifetime access for{" "}
            <Text style={styles.priceText}>{product?.price ?? "$9.99"}</Text>?
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
  generatingImage: {
    width: "100%",
    height: "100%",
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

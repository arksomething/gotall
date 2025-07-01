import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { logEvent } from "../../utils/FirebaseAnalytics";
import { useUserData } from "../../utils/UserContext";
import { calculateHeightProjection } from "../../utils/heightProjection";
import { PRODUCTS, useIAP } from "../../utils/products";

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [heightDifference, setHeightDifference] = useState(2);
  const {
    products,
    isPurchasing,
    error,
    handlePurchase,
    handleRestore,
    checkAvailablePurchases,
  } = useIAP();

  useEffect(() => {
    if (userData?.heightCm) {
      try {
        const projectionData = calculateHeightProjection({
          heightCm: userData.heightCm,
          age: getAge(),
          sex: userData.sex,
          motherHeightCm: userData.motherHeightCm,
          fatherHeightCm: userData.fatherHeightCm,
        });

        const [potentialFeet, potentialInches] = projectionData.potentialHeight
          .split("'")
          .map((v) => parseFloat(v));
        const [actualFeet, actualInches] = projectionData.actualHeight
          .split("'")
          .map((v) => parseFloat(v));

        const potentialTotalInches = potentialFeet * 12 + potentialInches;
        const actualTotalInches = actualFeet * 12 + actualInches;

        const difference = Math.round(potentialTotalInches - actualTotalInches);
        setHeightDifference(difference);
      } catch (error) {
        console.error("Error calculating height difference:", error);
      }
    }
  }, [userData, getAge]);

  const onPurchase = async () => {
    if (selectedIndex === null || !products[selectedIndex]) return;

    try {
      logEvent("purchase_button_click", {
        productId: products[selectedIndex].productId,
      });

      await handlePurchase(products[selectedIndex].productId);
      // Check if the purchase was actually completed
      const purchases = await checkAvailablePurchases();
      if (purchases.length > 0) {
        await AsyncStorage.setItem("@onboarding_completed", "true");
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const onRestore = async () => {
    logEvent("restore_purchases_click");
    const hasValidPurchase = await handleRestore();
    if (hasValidPurchase) {
      await AsyncStorage.setItem("@onboarding_completed", "true");
      router.replace("/(tabs)");
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
      onNext={onPurchase}
      nextButtonText={isPurchasing ? "Processing..." : "Unlock Now"}
      disableDefaultNext={isPurchasing || selectedIndex === null}
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
              onPress={() => {
                logEvent("subscription_option_select", {
                  productId: p.productId,
                });
                setSelectedIndex(idx);
              }}
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
            onPress={onRestore}
            disabled={isPurchasing}
          >
            <Text style={styles.restoreText}>
              {isPurchasing ? "Processing..." : "Restore Purchases"}
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

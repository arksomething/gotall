import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { logEvent } from "../../utils/Analytics";
import { useOnboarding } from "../../utils/OnboardingContext";
import { useUserData } from "../../utils/UserContext";
import { calculateHeightProjection } from "../../utils/heightProjection";
import { PRODUCTS, useIAP } from "../../utils/products";

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const {
    products,
    handlePurchase,
    handleRestore,
    isPurchasing,
    checkAvailablePurchases,
  } = useIAP();
  const { setIsOnboardingComplete } = useOnboarding();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [heightDifference, setHeightDifference] = useState(2);
  const [promoCode, setPromoCode] = useState<string>("");
  const validPromoCodes = ["GOTALLREVIEW", "PLAYREVIEW"];
  const [showPromoInput, setShowPromoInput] = useState(false);

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

  // Set initial selected index when products are loaded
  useEffect(() => {
    if (products.length > 0 && selectedIndex === null) {
      setSelectedIndex(0);
    }
  }, [products]);

  const onPurchase = async () => {
    try {
      setError(null); // Clear any previous errors
      logEvent("subscription_purchase_attempt", {
        productId: products[selectedIndex!].productId,
      });

      await handlePurchase(products[selectedIndex!].productId);
      // Check if the purchase was actually completed
      const purchases = await checkAvailablePurchases();
      if (purchases.length > 0) {
        logEvent("subscription_purchase_success", {
          productId: products[selectedIndex!].productId,
        });
        await setIsOnboardingComplete(true);
        await AsyncStorage.setItem("@onboarding_completed", "true");
        router.replace("/(tabs)");
      } else {
        setError("Purchase was not completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Purchase failed:", err);
      setError(err?.message || "Purchase failed. Please try again.");
    }
  };

  const onRestore = async () => {
    try {
      setError(null); // Clear any previous errors
      logEvent("restore_purchases_click");
      const hasValidPurchase = await handleRestore();
      if (hasValidPurchase) {
        await setIsOnboardingComplete(true);
        await AsyncStorage.setItem("@onboarding_completed", "true");
        router.replace("/(tabs)");
      } else {
        setError("No valid purchases found");
      }
    } catch (err: any) {
      console.error("Restore failed:", err);
      setError(
        err?.message || "Failed to restore purchases. Please try again."
      );
    }
  };

  const onRedeemPromo = async () => {
    try {
      setError(null);
      const trimmed = promoCode.trim().toUpperCase();
      if (!validPromoCodes.includes(trimmed)) {
        setError("Invalid promo code");
        return;
      }

      logEvent("promo_code_redeem", { promoCode: trimmed });
      await setIsOnboardingComplete(true);
      await AsyncStorage.setItem("@onboarding_completed", "true");
      await AsyncStorage.setItem("@promo_access", "true");
      DeviceEventEmitter.emit("promoAccessGranted");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Promo redeem failed:", err);
      setError(
        err?.message || "Failed to redeem promo code. Please try again."
      );
    }
  };

  return (
    <OnboardingLayout
      title="Get GoTall Now"
      currentStep={14}
      showBackButton={true}
      onBack={onBack}
      onNext={onPurchase}
      nextButtonText={isPurchasing ? "Processing..." : "Continue"}
      disableDefaultNext={isPurchasing || selectedIndex === null}
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          {selectedIndex !== null &&
            products[selectedIndex] &&
            PRODUCTS[
              products[selectedIndex].productId === PRODUCTS.LIFETIME.id
                ? "LIFETIME"
                : "WEEKLY"
            ].description}
        </Text>

        <View style={styles.plansContainer}>
          {products.map((p, idx) => {
            const isLifetime = p.productId === PRODUCTS.LIFETIME.id;
            const productType = isLifetime ? "LIFETIME" : "WEEKLY";
            const cleanTitle = p.title.replace(/ \(.*\)$/, "");
            const isSelected = selectedIndex === idx;

            return (
              <TouchableOpacity
                key={p.productId}
                style={[
                  styles.planBox,
                  isLifetime && styles.planBoxLifetime,
                  isSelected && styles.planBoxSelected,
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
                    styles.planLabel,
                    isSelected && styles.planLabelSelected,
                  ]}
                >
                  {cleanTitle}
                </Text>
                <Text style={styles.planPrice}>{p.localizedPrice}</Text>
                {isLifetime && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Here's what you'll get:</Text>
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>
              Earn genuine respect from women
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>Feel secure about yourself</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>
              Walk into any room with real confidence
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>
              Never be underestimated again
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>
              A robust plan of action to achieve your goals
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={onRestore}
            disabled={isPurchasing}
          >
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          {showPromoInput ? (
            <View style={styles.promoContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Promo Code"
                placeholderTextColor="#9ACD32"
                value={promoCode}
                autoCapitalize="characters"
                onChangeText={setPromoCode}
              />
              <TouchableOpacity
                style={styles.promoApplyButton}
                onPress={onRedeemPromo}
                disabled={promoCode.trim() === ""}
              >
                <Text style={styles.promoApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={() => setShowPromoInput(true)}
            >
              <Text style={styles.restoreText}>Promo</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  plansContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  planBox: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    position: "relative",
  },
  planBoxLifetime: {
    backgroundColor: "#1a1a1a",
    borderColor: "#444",
    borderWidth: 1.5,
  },
  planBoxSelected: {
    borderColor: "#9ACD32",
    borderWidth: 2,
    backgroundColor: "rgba(154, 205, 50, 0.1)",
    transform: [{ scale: 1.02 }],
  },
  planLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  planLabelSelected: {
    color: "#9ACD32",
  },
  planPrice: {
    color: "#9ACD32",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: "#9ACD32",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  benefitsContainer: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  benefitItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  benefitText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomActions: {
    marginTop: "auto",
    alignItems: "center",
    gap: 0,
  },
  restoreText: {
    color: "#9ACD32",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  promoContainer: {
    flexDirection: "row",
    marginTop: 8,
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  promoApplyButton: {
    backgroundColor: "#9ACD32",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  promoApplyText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 20,
  },
});

export default withOnboarding(SubscriptionScreen, 8, "subscription");

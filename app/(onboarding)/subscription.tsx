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
  getProducts,
  getPurchaseHistory,
  initConnection,
  Product,
  requestPurchase,
} from "react-native-iap";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useUserData } from "../../utils/UserContext";
import { calculateHeightProjection } from "../../utils/heightProjection";

const LIFETIME_ACCESS_ID = Platform.select({
  ios: "gotall.lifetime.access.nonc",
  android: "gotall.lifetime.access.nonc",
  default: "gotall.lifetime.access.nonc",
});

function SubscriptionScreen({ onBack }: OnboardingScreenProps) {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
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
        await initConnection();
        const products = await getProducts({ skus: [LIFETIME_ACCESS_ID] });
        if (products.length > 0) {
          setProduct(products[0]);
        } else {
          setError("Product not available");
        }
      } catch (e) {
        console.warn("Failed to load product");
        setError("Failed to load product details");
      }
    };

    initialize();
  }, []);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      setError(null);
      await getPurchaseHistory();
      // If restore is successful, user will be redirected by the purchase listener
    } catch (e) {
      console.warn("Restore failed", e);
      setError("Failed to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    try {
      setIsPurchasing(true);
      setError(null);
      await requestPurchase({ sku: product.productId });
    } catch (e) {
      console.warn("Purchase failed");
      setError("Purchase failed. Please try again.");
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
      nextButtonText={isPurchasing ? "Processing..." : "Unlock Full Access"}
      disableDefaultNext={isPurchasing || isRestoring || !product}
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
          {error ? (
            <Text style={[styles.subscriptionText, styles.errorText]}>
              {error}
            </Text>
          ) : product ? (
            <Text style={styles.subscriptionText}>
              Do you wish to proceed with a lifetime access for{" "}
              <Text style={styles.priceText}>{product.localizedPrice}</Text>?
              {"\n\n"}
              <Text style={styles.descriptionText}>{product.description}</Text>
            </Text>
          ) : (
            <Text style={styles.subscriptionText}>
              Loading product details...
            </Text>
          )}

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
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9ACD32",
  },
  descriptionText: {
    fontSize: 16,
    color: "#ccc",
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
});

export default withOnboarding(SubscriptionScreen, 8, "subscription");

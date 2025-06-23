import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  EmitterSubscription,
  Platform,
  View,
} from "react-native";
import {
  endConnection,
  finishTransaction,
  getProducts,
  getPurchaseHistory,
  initConnection,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";
import { UserProvider } from "../utils/UserContext";

const LIFETIME_ACCESS_ID = Platform.select({
  ios: "gotall.lifetime.access.nonc",
  android: "gotall.lifetime.access.nonc",
  default: "gotall.lifetime.access.nonc",
});

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userHasLifetimeAccess, setUserHasLifetimeAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let purchaseUpdateSubscription: EmitterSubscription | null = null;
    let purchaseErrorSubscription: EmitterSubscription | null = null;

    const initialize = async () => {
      try {
        // 1. Initialize connection to store
        await initConnection();

        // 2. Get available products to validate our product ID
        try {
          const products = await getProducts({ skus: [LIFETIME_ACCESS_ID] });
          if (products.length === 0) {
            console.warn(`Product ${LIFETIME_ACCESS_ID} not found in store`);
          }
        } catch (e) {
          console.warn("Error fetching products");
        }

        // 3. Set up purchase success listener
        purchaseUpdateSubscription = purchaseUpdatedListener(
          async (purchase) => {
            const receipt = purchase.transactionReceipt;

            if (receipt) {
              try {
                // Unlock content for the user
                await AsyncStorage.setItem("@onboarding_completed", "true");
                setIsOnboardingComplete(true);
                setUserHasLifetimeAccess(true);

                // Finish the transaction
                await finishTransaction({ purchase });
              } catch (ackErr) {
                console.warn("Error acknowledging purchase");
              }
            }
          }
        );

        // 4. Set up purchase error listener
        purchaseErrorSubscription = purchaseErrorListener(
          (error: PurchaseError) => {
            if (error.code === "E_USER_CANCELLED") {
              console.log("Purchase cancelled");
            } else if (error.code === "E_DEVELOPER_ERROR") {
              console.warn("Developer error - check store configuration");
            } else {
              console.warn("Purchase error:", error.code);
            }
          }
        );

        // 5. Check current onboarding status
        await checkOnboardingStatus();

        // 6. Check if user already owns the product
        try {
          const purchases = await getPurchaseHistory();
          const hasAccess = purchases.some(
            (purchase) => purchase.productId === LIFETIME_ACCESS_ID
          );

          setUserHasLifetimeAccess(hasAccess);

          if (hasAccess && !isOnboardingComplete) {
            await AsyncStorage.setItem("@onboarding_completed", "true");
            setIsOnboardingComplete(true);
          }
        } catch (e) {
          console.warn("Error checking purchase history");
        }
      } catch (e) {
        console.warn("Error setting up in-app purchases");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      endConnection();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isOnboardingComplete && userHasLifetimeAccess) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)");
      }
    }
  }, [isLoading, isOnboardingComplete, router, userHasLifetimeAccess]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(
        "@onboarding_completed"
      );
      setIsOnboardingComplete(onboardingComplete === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboardingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#9ACD32" />
      </View>
    );
  }

  return (
    <UserProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#000" />
    </UserProvider>
  );
}

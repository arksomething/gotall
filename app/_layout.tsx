import "@react-native-firebase/app";
import Constants from "expo-constants";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SuperwallProvider } from "expo-superwall";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  endConnection,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingProvider, useOnboarding } from "../utils/OnboardingContext";
import { PRODUCTS } from "../utils/products";
import { initTikTok } from "../utils/TikTokAnalytics";
import { UserProvider } from "../utils/UserContext";

const LIFETIME_ACCESS_ID = PRODUCTS.LIFETIME.id;
const WEEKLY_ACCESS_ID = PRODUCTS.WEEKLY.id;

function NavigationRoot() {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const { isOnboardingComplete } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const purchases = await getAvailablePurchases();
        setHasValidAccess(purchases.length > 0);
      } catch (error) {
        console.error("Error checking purchase status:", error);
      }
    };

    const initializeApp = async () => {
      if (!initialized) {
        try {
          await initConnection();
          await checkPurchaseStatus();
          setInitialized(true);
        } catch (error: any) {
          console.error("Error initializing app:", error);
          // If billing is unavailable, still let the app proceed
          if (error.message?.includes("Billing is unavailable")) {
            setInitialized(true);
            setHasValidAccess(false); // Assume no valid access if billing is unavailable
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeApp();

    const purchaseUpdate = purchaseUpdatedListener(async () => {
      await checkPurchaseStatus();
    });

    const purchaseError = purchaseErrorListener((error) => {
      console.warn("Purchase error:", error);
    });

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
      if (initialized) {
        endConnection();
      }
    };
  }, [initialized]);

  // Initialise TikTok SDK once
  useEffect(() => {
    const ttAppId = (Constants?.expoConfig?.extra as any)?.tiktokAppId;
    if (ttAppId) {
      initTikTok(ttAppId, __DEV__);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isOnboardingComplete || !hasValidAccess) {
      // If onboarding is not complete or no valid purchase, ensure we're in onboarding
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)");
      }
    } else {
      // If everything is complete, ensure we're in tabs
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, isOnboardingComplete, hasValidAccess, segments]);

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
    <>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: "#000",
          zIndex: 999,
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const swApiKey = (Constants?.expoConfig?.extra as any)?.superwallApiKey;
  return (
    <SuperwallProvider
      apiKeys={{ ios: swApiKey, android: swApiKey }}
      options={{ isPaidSubscriptionEnabled: true }}
    >
      <UserProvider>
        <OnboardingProvider>
          <NavigationRoot />
          <StatusBar style="light" backgroundColor="#000" />
        </OnboardingProvider>
      </UserProvider>
    </SuperwallProvider>
  );
}

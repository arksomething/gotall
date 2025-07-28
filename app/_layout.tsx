import AsyncStorage from "@react-native-async-storage/async-storage";
import "@react-native-firebase/app";
import Constants from "expo-constants";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SuperwallProvider } from "expo-superwall";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, View } from "react-native";
import {
  endConnection,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";
import { crashlytics } from "../utils/crashlytics";
import { initializeErrorHandling } from "../utils/errorHandler";
import { OnboardingProvider, useOnboarding } from "../utils/OnboardingContext";
import { PRODUCTS } from "../utils/products";
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
        const promoAccess = await AsyncStorage.getItem("@promo_access");
        setHasValidAccess(purchases.length > 0 || promoAccess === "true");
      } catch (error) {
        console.error("Error checking purchase status:", error);
        // Don't let purchase errors crash the app
        setHasValidAccess(false);
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
          } else {
            // For other errors, still initialize but with no access
            setInitialized(true);
            setHasValidAccess(false);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeApp();

    // Listen for promo access grant events
    const promoListener = DeviceEventEmitter.addListener(
      "promoAccessGranted",
      () => {
        setHasValidAccess(true);
      }
    );

    const purchaseUpdate = purchaseUpdatedListener(async () => {
      try {
        await checkPurchaseStatus();
      } catch (error) {
        console.error("Error in purchase update listener:", error);
      }
    });

    const purchaseError = purchaseErrorListener((error) => {
      console.warn("Purchase error:", error);
    });

    return () => {
      try {
        purchaseUpdate.remove();
        purchaseError.remove();
        promoListener.remove();
        if (initialized) {
          endConnection();
        }
      } catch (error) {
        console.error("Error cleaning up purchase listeners:", error);
      }
    };
  }, [initialized]);

  // Initialise TikTok SDK once
  useEffect(() => {
    const ttAppId = (Constants?.expoConfig?.extra as any)?.tiktokAppId;
    // if (ttAppId) {
    //   initTikTok(ttAppId, __DEV__);
    // }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isOnboardingComplete || !hasValidAccess) {
      // If onboarding is not complete or no valid purchase, ensure we're in onboarding
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)");
      } else {
        SplashScreen.hideAsync();
      }
    } else {
      // If everything is complete, ensure we're in tabs
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      } else {
        SplashScreen.hideAsync();
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
      {/* Status bar overlay colored per route group */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor:
            segments[0] === "(onboarding)" && segments.length === 1
              ? "#9ACD32"
              : "#000",
          zIndex: 999,
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
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

  SplashScreen.preventAutoHideAsync();

  // Initialize global error handling and Crashlytics
  useEffect(() => {
    const initializeServices = async () => {
      try {
        initializeErrorHandling();
        await crashlytics.initialize();
        console.log("Error handling and Crashlytics initialized successfully");
      } catch (error) {
        console.error("Failed to initialize error handling services:", error);
      }
    };

    initializeServices();
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

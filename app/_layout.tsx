import AsyncStorage from "@react-native-async-storage/async-storage";
import * as InAppPurchases from "expo-in-app-purchases";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { UserProvider } from "../utils/UserContext";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      await checkOnboardingStatus();
      try {
        await InAppPurchases.connectAsync();
        InAppPurchases.setPurchaseListener(
          async ({ responseCode, results }) => {
            if (responseCode === InAppPurchases.IAPResponseCode.OK) {
              if (results) {
                for (const purchase of results) {
                  if (!purchase.acknowledged) {
                    console.log(`Successfully purchased ${purchase.productId}`);
                    await InAppPurchases.finishTransactionAsync(
                      purchase,
                      false
                    );
                    await AsyncStorage.setItem("@onboarding_completed", "true");
                    setIsOnboardingComplete(true);
                    router.replace("/(tabs)");
                  }
                }
              }
            }
          }
        );

        const history = await InAppPurchases.getPurchaseHistoryAsync();
        if (history.results) {
          for (const purchase of history.results) {
            if (!purchase.acknowledged) {
              console.log(
                "[Startup] Finishing unacknowledged purchase:",
                purchase.productId
              );
              await AsyncStorage.setItem("@onboarding_completed", "true");
              setIsOnboardingComplete(true);
              router.replace("/(tabs)");
              await InAppPurchases.finishTransactionAsync(purchase, false);
            }
          }
        }
      } catch (e) {
        console.warn("Error setting up in-app purchases listener", e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

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

  // Show loading spinner while checking onboarding status
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
        {!isOnboardingComplete ? (
          <Stack.Screen name="(onboarding)" />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="light" backgroundColor="#000" />
    </UserProvider>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { UserProvider } from "../utils/UserContext";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
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
    } finally {
      setIsLoading(false);
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
          <Stack.Screen name="onboarding" />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="light" backgroundColor="#000" />
    </UserProvider>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  setIsOnboardingComplete: (value: boolean) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState(false);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("@onboarding_completed");
        setIsOnboardingCompleteState(value === "true");
      } catch (error) {
        console.error("Error loading onboarding status:", error);
      }
    };
    loadOnboardingStatus();
  }, []);

  const setIsOnboardingComplete = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("@onboarding_completed", String(value));
      setIsOnboardingCompleteState(value);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ isOnboardingComplete, setIsOnboardingComplete }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useOnboarding } from "../app/(onboarding)/_layout";
import { logScreenView } from "../utils/FirebaseAnalytics";
import { validateHeightInput } from "../utils/heightUtils";
import { useUserData } from "../utils/UserContext";

export const ROUTES = [
  "index",
  "birthdate",
  "sex",
  "ethnicity",
  "measurements",
  "parents",
  "shoe",
  "dream",
  "product",
  "trust",
  "reviews",
  "short",
  "generating",
  "results",
  "projection",
  "subscription",
] as const;

export interface OnboardingScreenProps {
  onNext?: () => void;
  onBack?: () => void;
}

type Route = (typeof ROUTES)[number];
type HeightUnit = "ft" | "cm";

export function withOnboarding<P extends OnboardingScreenProps>(
  WrappedComponent: React.ComponentType<P>,
  currentStep: number,
  route: Route,
  nextRoute?: Route
) {
  return function WithOnboardingComponent(
    props: Omit<P, keyof OnboardingScreenProps>
  ) {
    const router = useRouter();
    const { updateUserData } = useUserData();
    const {
      setCurrentStep,
      dateOfBirth,
      sex,
      height,
      weight,
      motherHeight,
      fatherHeight,
      ethnicity,
      preferredHeightUnit,
      preferredWeightUnit,
      usShoeSize,
      euShoeSize,
    } = useOnboarding();

    // Log screen view when component mounts
    useEffect(() => {
      logScreenView(route);
    }, []);

    const handleNext = async () => {
      // Validation logic based on current step
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (route === "parents") {
        const motherHeightValidation = validateHeightInput(
          motherHeight,
          preferredHeightUnit as HeightUnit
        );
        const fatherHeightValidation = validateHeightInput(
          fatherHeight,
          preferredHeightUnit as HeightUnit
        );
        if (!motherHeightValidation.isValid) {
          Alert.alert(
            "Invalid Mother's Height",
            motherHeightValidation.errorMessage || "Please enter a valid height"
          );
          return;
        }
        if (!fatherHeightValidation.isValid) {
          Alert.alert(
            "Invalid Father's Height",
            fatherHeightValidation.errorMessage || "Please enter a valid height"
          );
          return;
        }
      }

      // Update user data after each step
      try {
        const partialUserData: any = {};

        switch (route) {
          case "birthdate":
            partialUserData.dateOfBirth = dateOfBirth
              .toISOString()
              .split("T")[0];
            break;
          case "sex":
            partialUserData.sex = sex;
            break;
          case "shoe":
            partialUserData.usShoeSize = usShoeSize;
            partialUserData.euShoeSize = euShoeSize;
            break;
        }

        if (Object.keys(partialUserData).length > 0) {
          await updateUserData(partialUserData);
        }

        // Navigate to next screen
        const defaultNextRoute = ROUTES[ROUTES.indexOf(route) + 1];
        const targetRoute = nextRoute || defaultNextRoute;
        if (targetRoute) {
          setCurrentStep(currentStep + 1);
          router.push(`/(onboarding)/${targetRoute}` as any);
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    };

    const handleBack = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (currentStep > 0) {
        const prevRoute = ROUTES[ROUTES.indexOf(route) - 1];
        if (prevRoute) {
          setCurrentStep(currentStep - 1);
          if (prevRoute == "index") {
            router.replace("/(onboarding)" as any);
          } else {
            router.replace(`/(onboarding)/${prevRoute}` as any);
          }
        }
      }
    };

    return (
      <WrappedComponent
        {...(props as P)}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  };
}

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useOnboarding } from "../app/(onboarding)/_layout";
import { logScreenView, setUserProperty } from "../utils/FirebaseAnalytics";
import { validateHeightInput } from "../utils/heightUtils";
import {
  getNextRoute,
  getPrevRoute,
  OnboardingRoute,
} from "../utils/onboardingFlow";
import { useUserData } from "../utils/UserContext";

export const ROUTES = [] as const; // deprecated: use manifest in onboardingFlow

export interface OnboardingScreenProps {
  onNext?: () => void;
  onBack?: () => void;
}

type HeightUnit = "ft" | "cm";

export function withOnboarding<P extends OnboardingScreenProps>(
  WrappedComponent: React.ComponentType<P>,
  route: OnboardingRoute
) {
  return function WithOnboardingComponent(
    props: Omit<P, keyof OnboardingScreenProps>
  ) {
    const router = useRouter();
    const { updateUserData } = useUserData();
    const onboarding = useOnboarding();
    const {
      setCurrentStep,
      dateOfBirth,
      sex,
      attribution,
      height,
      weight,
      motherHeight,
      fatherHeight,
      ethnicity,
      preferredHeightUnit,
      preferredWeightUnit,
      usShoeSize,
      euShoeSize,
      dreamHeightCm,
    } = onboarding;

    // Log screen view when component mounts
    useEffect(() => {
      logScreenView(route);
    }, [route]);

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
          case "attribution":
            partialUserData.attribution = attribution;
            break;
          case "dream":
            if (dreamHeightCm !== null) {
              partialUserData.dreamHeightCm = dreamHeightCm;
            }
            break;
          case "shoe":
            partialUserData.usShoeSize = usShoeSize;
            partialUserData.euShoeSize = euShoeSize;
            break;
          // Puberty routes save immediately on selection via updateUserData
        }

        if (Object.keys(partialUserData).length > 0) {
          await updateUserData(partialUserData);
          // Update user properties for analytics to enable user-level filtering
          try {
            if (route === "sex") {
              await setUserProperty(
                "sex_label",
                sex === "1" ? "male" : sex === "2" ? "female" : "other"
              );
            }
            if (route === "attribution") {
              await setUserProperty("attribution", attribution || null);
            }
            if (route === "birthdate") {
              // Derive age years and set as string
              const ageYears = Math.max(
                0,
                Math.floor(
                  (Date.now() - dateOfBirth.getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25)
                )
              );
              await setUserProperty("age_years", String(ageYears));
            }
          } catch {}
        }

        const target = getNextRoute(route, onboarding as any);
        if (target) {
          // Maintain numeric step for legacy consumers
          setCurrentStep((onboarding.currentStep || 0) + 1);
          router.push(`/(onboarding)/${target}` as any);
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    };

    const handleBack = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prev = getPrevRoute(route, onboarding as any);
      if (prev) {
        setCurrentStep(Math.max(0, (onboarding.currentStep || 0) - 1));
        if (prev === "index") {
          router.replace("/(onboarding)" as any);
        } else {
          router.replace(`/(onboarding)/${prev}` as any);
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

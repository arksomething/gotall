import { Stack } from "expo-router";
import React, { createContext, useContext, useState } from "react";
import {
  generateImperialHeight,
  generateImperialWeight,
  generateMetricHeight,
  generateMetricWeight,
} from "../../utils/pickerData";
import { UserData, useUserData } from "../../utils/UserContext";

// Define picker data type
interface PickerItem {
  label: string;
  value: string;
}

// Define the context type
interface OnboardingContextType {
  dateOfBirth: Date;
  setDateOfBirth: (date: Date) => void;
  sex: "1" | "2";
  setSex: (sex: "1" | "2") => void;
  height: string;
  setHeight: (height: string) => void;
  weight: string;
  setWeight: (weight: string) => void;
  motherHeight: string;
  setMotherHeight: (height: string) => void;
  fatherHeight: string;
  setFatherHeight: (height: string) => void;
  ethnicity: string;
  setEthnicity: (ethnicity: string) => void;
  usShoeSize: string;
  setUsShoeSize: (size: string) => void;
  euShoeSize: string;
  setEuShoeSize: (size: string) => void;
  units: "imperial" | "metric";
  setUnits: (units: "imperial" | "metric") => void;
  motherHeightFocused: boolean;
  setMotherHeightFocused: (focused: boolean) => void;
  fatherHeightFocused: boolean;
  setFatherHeightFocused: (focused: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  toggleUnits: () => void;
  heightData: PickerItem[];
  weightData: PickerItem[];
  preferredHeightUnit: string;
  preferredWeightUnit: string;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  dreamHeightCm: number | null;
  setDreamHeightCm: (value: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

export default function OnboardingLayout() {
  // Form state
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2004, 0, 1));
  const [sex, setSex] = useState<"1" | "2">("1");
  const [height, setHeight] = useState("5 ft 7 in");
  const [weight, setWeight] = useState("150 lb");
  const [motherHeight, setMotherHeight] = useState("5 ft 7 in");
  const [fatherHeight, setFatherHeight] = useState("5 ft 10 in");
  const [ethnicity, setEthnicity] = useState("");
  const [usShoeSize, setUsShoeSize] = useState("9");
  const [euShoeSize, setEuShoeSize] = useState("42");
  const [units, setUnits] = useState<"imperial" | "metric">("imperial");

  // Focus states
  const [motherHeightFocused, setMotherHeightFocused] = useState(false);
  const [fatherHeightFocused, setFatherHeightFocused] = useState(false);

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const { updateUserData } = useUserData();

  const preferredHeightUnit = units === "imperial" ? "ft" : "cm";
  const preferredWeightUnit = units === "imperial" ? "lbs" : "kg";

  const heightData =
    units === "imperial" ? generateImperialHeight() : generateMetricHeight();
  const weightData =
    units === "imperial" ? generateImperialWeight() : generateMetricWeight();

  const toggleUnits = () => {
    const newUnits = units === "imperial" ? "metric" : "imperial";
    setUnits(newUnits);

    if (newUnits === "metric") {
      setHeight("170 cm");
      setWeight("68 kg");
      setMotherHeight("165 cm");
      setFatherHeight("178 cm");
    } else {
      setHeight("5 ft 7 in");
      setWeight("150 lb");
      setMotherHeight("5 ft 7 in");
      setFatherHeight("5 ft 10 in");
    }
  };

  const [dreamHeightCm, setDreamHeightCm] = useState<number | null>(
    Math.round((5 * 12 + 10) * 2.54)
  ); // Default to 5'10" (178cm)

  return (
    <OnboardingContext.Provider
      value={{
        dateOfBirth,
        setDateOfBirth,
        sex,
        setSex,
        height,
        setHeight,
        weight,
        setWeight,
        motherHeight,
        setMotherHeight,
        fatherHeight,
        setFatherHeight,
        ethnicity,
        setEthnicity,
        usShoeSize,
        setUsShoeSize,
        euShoeSize,
        setEuShoeSize,
        units,
        setUnits,
        motherHeightFocused,
        setMotherHeightFocused,
        fatherHeightFocused,
        setFatherHeightFocused,
        currentStep,
        setCurrentStep,
        isGenerating,
        setIsGenerating,
        toggleUnits,
        heightData,
        weightData,
        preferredHeightUnit,
        preferredWeightUnit,
        updateUserData,
        dreamHeightCm,
        setDreamHeightCm,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 150,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="birthdate"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen name="sex" />
        <Stack.Screen name="ethnicity" />
        <Stack.Screen name="measurements" />
        <Stack.Screen name="parents" />
        <Stack.Screen name="shoe" />
        <Stack.Screen name="dream" />
        <Stack.Screen name="product" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="short" />
        <Stack.Screen name="generating" />
        <Stack.Screen name="results" />
        <Stack.Screen name="projection" />
        <Stack.Screen name="subscription" />
      </Stack>
    </OnboardingContext.Provider>
  );
}

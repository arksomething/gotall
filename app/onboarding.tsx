import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DatePicker } from "../components/DatePicker";
import { DualPicker } from "../components/DualPicker";
import { UserData, useUserData } from "../utils/UserContext";
import { parseHeightToCm, validateHeightInput } from "../utils/heightUtils";
import {
  generateImperialHeight,
  generateImperialWeight,
  generateMetricHeight,
  generateMetricWeight,
} from "../utils/pickerData";

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateUserData } = useUserData();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2004, 0, 1));
  const [sex, setSex] = useState<"1" | "2">("1");
  const [height, setHeight] = useState("5 ft  7 in");
  const [weight, setWeight] = useState("150 lb");
  const [motherHeight, setMotherHeight] = useState("5 ft 7 in");
  const [fatherHeight, setFatherHeight] = useState("5 ft 10 in");
  const [ethnicity, setEthnicity] = useState("");
  const [units, setUnits] = useState<"imperial" | "metric">("imperial");

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [motherHeightFocused, setMotherHeightFocused] = useState(false);
  const [fatherHeightFocused, setFatherHeightFocused] = useState(false);

  const preferredHeightUnit = units === "imperial" ? "ft" : "cm";
  const preferredWeightUnit = units === "imperial" ? "lbs" : "kg";

  const heightData = useMemo(
    () =>
      units === "imperial" ? generateImperialHeight() : generateMetricHeight(),
    [units]
  );
  const weightData = useMemo(
    () =>
      units === "imperial" ? generateImperialWeight() : generateMetricWeight(),
    [units]
  );

  const ethnicityOptions = [
    "Caucasian",
    "African American",
    "Hispanic/Latino",
    "Asian",
    "Native American",
    "Pacific Islander",
    "Mixed/Other",
  ];

  const steps = [
    {
      title: "Welcome to Posture+",
      subtitle: "Let's get you set up for better posture tracking",
      icon: "hand-right-outline",
    },
    {
      title: "What's your name?",
      subtitle: "We'll use this to personalize your experience",
      icon: "person-outline",
    },
    {
      title: "When were you born?",
      subtitle: "This helps us provide age-appropriate recommendations",
      icon: "calendar-outline",
    },
    {
      title: "What's your biological sex?",
      subtitle: "This is used for accurate growth percentile calculations",
      icon: "male-female-outline",
    },
    {
      title: "What's your ethnicity?",
      subtitle: "This helps provide more accurate growth standards",
      icon: "globe-outline",
      scrollable: true,
    },
    {
      title: "Select your height / weight",
      subtitle: "You can adjust the units with the toggle below",
      icon: "accessibility-outline",
    },
    {
      title: "Parents' height",
      subtitle: "This helps predict your growth potential",
      icon: "people-outline",
    },
  ];

  const handleNext = async () => {
    if (currentStep === 1 && !name.trim()) {
      Alert.alert("Name Required", "Please enter your name to continue");
      return;
    }

    if (currentStep === 6) {
      const motherHeightValidation = validateHeightInput(
        motherHeight,
        preferredHeightUnit
      );
      const fatherHeightValidation = validateHeightInput(
        fatherHeight,
        preferredHeightUnit
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

    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const heightInCm = parseHeightToCm(height, preferredHeightUnit);

      const userData: Partial<UserData> = {
        name: name.trim(),
        heightCm: heightInCm,
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        sex,
        weight: parseFloat(weight) || 0,
        motherHeightCm: parseHeightToCm(motherHeight, preferredHeightUnit),
        fatherHeightCm: parseHeightToCm(fatherHeight, preferredHeightUnit),
        ethnicity,
        preferredWeightUnit,
        preferredHeightUnit,
      };

      await updateUserData(userData);
      await AsyncStorage.setItem("@onboarding_completed", "true");
      router.replace("/(tabs)" as any);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to save your information. Please try again."
      );
      console.error("Onboarding save error:", error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const renderStepContent = () => {
    const currentStepInfo = steps[currentStep];

    const content = () => {
      switch (currentStep) {
        case 0:
          return (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="hand-right-outline" size={80} color="#9ACD32" />
              </View>
              <Text style={styles.welcomeText}>
                Track your posture, build better habits, and improve your health
                with comprehensive tracking and family genetics insights.
              </Text>
            </View>
          );
        case 1:
          return (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={80} color="#9ACD32" />
              </View>
              <TextInput
                style={[
                  styles.input,
                  (nameFocused || name.trim()) && styles.inputActive,
                ]}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          );
        case 2:
          return (
            <View style={styles.stepContent}>
              <DatePicker
                onDateChange={setDateOfBirth}
                initialDate={dateOfBirth}
              />
            </View>
          );
        case 3:
          return (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="male-female-outline"
                  size={80}
                  color="#9ACD32"
                />
              </View>
              <View style={styles.sexSelector}>
                <TouchableOpacity
                  style={[
                    styles.sexButton,
                    sex === "1" && styles.sexButtonActive,
                  ]}
                  onPress={() => setSex("1")}
                >
                  <Ionicons
                    name="man-outline"
                    size={40}
                    color={sex === "1" ? "#000" : "#9ACD32"}
                  />
                  <Text
                    style={[
                      styles.sexText,
                      sex === "1" && styles.sexTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sexButton,
                    sex === "2" && styles.sexButtonActive,
                  ]}
                  onPress={() => setSex("2")}
                >
                  <Ionicons
                    name="woman-outline"
                    size={40}
                    color={sex === "2" ? "#000" : "#9ACD32"}
                  />
                  <Text
                    style={[
                      styles.sexText,
                      sex === "2" && styles.sexTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        case 4:
          return (
            <View style={styles.stepContent}>
              {ethnicityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.ethnicityButton,
                    ethnicity === option && styles.ethnicityButtonActive,
                  ]}
                  onPress={() => setEthnicity(option)}
                >
                  <Text
                    style={[
                      styles.ethnicityText,
                      ethnicity === option && styles.ethnicityTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        case 5:
          return (
            <View style={styles.stepContent}>
              <DualPicker
                title="Select your height and weight"
                leftLabel="Height"
                rightLabel="Weight"
                leftValue={height}
                rightValue={weight}
                onLeftValueChange={setHeight}
                onRightValueChange={setWeight}
                items={[heightData, weightData]}
                showUnits={true}
                isMetric={units === "metric"}
                onUnitsChange={toggleUnits}
              />
            </View>
          );
        case 6:
          return (
            <View style={styles.stepContent}>
              <DualPicker
                title="Select your parents height"
                leftLabel="Dad"
                rightLabel="Mom"
                leftValue={fatherHeight}
                rightValue={motherHeight}
                onLeftValueChange={setFatherHeight}
                onRightValueChange={setMotherHeight}
                items={heightData}
                showUnits={true}
                isMetric={units === "metric"}
                onUnitsChange={toggleUnits}
              />
            </View>
          );
        default:
          return null;
      }
    };

    if (currentStepInfo.scrollable) {
      return <ScrollView>{content()}</ScrollView>;
    }

    return content();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 40}
        enabled={currentStep === 1}
      >
        <View
          style={[
            styles.mainContent,
            currentStep === 1 && styles.nameStepContent,
          ]}
        >
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backArrow} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          </View>

          <View style={styles.contentContainer}>{renderStepContent()}</View>
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={20} color="#666" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backArrow: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333",
    marginHorizontal: 2,
  },
  progressDotActive: {
    backgroundColor: "#9ACD32",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: 350,
  },
  stepContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  inputActive: {
    borderColor: "#9ACD32",
  },
  unitHint: {
    color: "#666",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  sexSelector: {
    flexDirection: "row",
    gap: 20,
  },
  sexButton: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minWidth: 120,
    borderWidth: 2,
    borderColor: "#333",
  },
  sexButtonActive: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  sexText: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  sexTextActive: {
    color: "#000",
  },
  ethnicityButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#333",
    width: "100%",
    alignItems: "center",
  },
  ethnicityButtonActive: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  ethnicityText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  ethnicityTextActive: {
    color: "#000",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  pickerHalf: {
    flex: 1,
    marginVertical: 0,
  },
  unitToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  unitToggleLabel: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "#000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: "#9ACD32",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginLeft: 20,
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  nameStepContent: {
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    justifyContent: "flex-start",
  },
});

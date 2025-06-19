import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

const ethnicityOptions = [
  "Caucasian",
  "African American",
  "Hispanic/Latino",
  "Asian",
  "Native American",
  "Pacific Islander",
  "Mixed/Other",
];

function EthnicityScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { ethnicity, setEthnicity } = useOnboarding();

  return (
    <OnboardingLayout
      title="What is your ethnicity?"
      currentStep={3}
      onNext={onNext}
      onBack={onBack}
    >
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
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    width: "100%",
  },
  ethnicityButton: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  ethnicityTextActive: {
    color: "#000",
  },
});

export default withOnboarding(EthnicityScreen, 3, "ethnicity");

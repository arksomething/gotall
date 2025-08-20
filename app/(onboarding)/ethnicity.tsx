import React from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionList } from "../../components/SelectionList";
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
        <SelectionList
          options={ethnicityOptions}
          selectedValue={ethnicity}
          onSelect={(value) => setEthnicity(value)}
        />
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
  // Button styles are encapsulated in SelectionList
});

export default withOnboarding(EthnicityScreen, 3, "ethnicity");

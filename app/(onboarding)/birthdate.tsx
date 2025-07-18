import React from "react";
import { StyleSheet, View } from "react-native";
import { DatePicker } from "../../components/DatePicker";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

function BirthdateScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { dateOfBirth, setDateOfBirth } = useOnboarding();

  return (
    <OnboardingLayout
      title="When were you born?"
      currentStep={1}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <DatePicker onDateChange={setDateOfBirth} initialDate={dateOfBirth} />
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
});

export default withOnboarding(BirthdateScreen, 1, "birthdate");

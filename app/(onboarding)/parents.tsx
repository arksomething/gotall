import React from "react";
import { StyleSheet, View } from "react-native";
import { DualPicker } from "../../components/DualPicker";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

function ParentsScreen({ onNext, onBack }: OnboardingScreenProps) {
  const {
    motherHeight,
    setMotherHeight,
    fatherHeight,
    setFatherHeight,
    heightData,
    units,
    toggleUnits,
  } = useOnboarding();

  return (
    <OnboardingLayout
      title="How tall are your parents?"
      currentStep={5}
      onNext={onNext}
      onBack={onBack}
    >
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

export default withOnboarding(ParentsScreen, 5, "parents", "generating");

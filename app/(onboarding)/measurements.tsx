import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { DualPicker } from "../../components/DualPicker";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

function MeasurementsScreen({ onNext, onBack }: OnboardingScreenProps) {
  const {
    height,
    setHeight,
    weight,
    setWeight,
    heightData,
    weightData,
    units,
    toggleUnits,
  } = useOnboarding();

  useEffect(() => {
    // Set initial height to 5'7" when component mounts
    if (units === "imperial") {
      setHeight("5 ft 7 in");
    }
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <OnboardingLayout
      title="What are your measurements?"
      currentStep={4}
      onNext={onNext}
      onBack={onBack}
    >
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

export default withOnboarding(MeasurementsScreen, 4, "measurements");

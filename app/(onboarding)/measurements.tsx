import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { DualPicker } from "../../components/DualPicker";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import i18n from "../../utils/i18n";
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
      title={i18n.t("onboarding:measurements_title")}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <DualPicker
          title={i18n.t("onboarding:measurements_picker_title")}
          leftLabel={i18n.t("onboarding:measurements_label_height")}
          rightLabel={i18n.t("onboarding:measurements_label_weight")}
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

export default withOnboarding(MeasurementsScreen, "measurements");

import React from "react";
import { StyleSheet, View } from "react-native";
import { DualPicker } from "../../components/DualPicker";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import i18n from "../../utils/i18n";
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
      title={i18n.t("onboarding:parents_title")}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <DualPicker
          title={i18n.t("onboarding:parents_picker_title")}
          leftLabel={i18n.t("onboarding:parents_label_father")}
          rightLabel={i18n.t("onboarding:parents_label_mother")}
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

export default withOnboarding(ParentsScreen, "parents");

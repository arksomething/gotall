import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionList } from "../../components/SelectionList";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import i18n from "../../utils/i18n";
import { useOnboarding } from "./_layout";

function EthnicityScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { ethnicity, setEthnicity } = useOnboarding();

  const ethnicityOptions = [
    t("onboarding:ethnicity_option_caucasian"),
    t("onboarding:ethnicity_option_african_american"),
    t("onboarding:ethnicity_option_hispanic_latino"),
    t("onboarding:ethnicity_option_asian"),
    t("onboarding:ethnicity_option_native_american"),
    t("onboarding:ethnicity_option_pacific_islander"),
    t("onboarding:ethnicity_option_mixed_other"),
  ];
  return (
    <OnboardingLayout
      title={i18n.t("onboarding:ethnicity_title")}
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

import React from "react";
import { StyleSheet, View } from "react-native";
import { AnalysisCard } from "../../../components/AnalysisCard";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { withOnboarding } from "../../../components/withOnboarding";
import i18n from "../../../utils/i18n";

const TANNER_ANALYSIS_PROMPT =
  "Analyze this image to estimate the user's age. Even if you can't accurately determine their age, just try your best and provide a rough estimate. Respond with a short, plain text explanation.";

function PubertyAnalysisScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <OnboardingLayout
      title={i18n.t("onboarding:analysis_title")}
      onNext={onNext}
      onBack={onBack}
      nextButtonText={i18n.t("onboarding:subscription_button_continue", {
        defaultValue: "Continue",
      })}
    >
      <View style={styles.container}>
        <AnalysisCard
          endpoint="https://foodanalyzer-2og6xa3ima-uc.a.run.app"
          prompt={TANNER_ANALYSIS_PROMPT}
          analyzeButtonText={i18n.t("onboarding:analysis_button_analyze_image")}
          maxImages={1}
          placeholderText={i18n.t("onboarding:analysis_placeholder_upload_one")}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withOnboarding(PubertyAnalysisScreen, "analysis");

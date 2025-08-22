import React from "react";
import { StyleSheet, View } from "react-native";
import { AnalysisCard } from "../../../components/AnalysisCard";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";

const TANNER_ANALYSIS_PROMPT =
  "Analyze this image to estimate the Tanner stage. Respond with a short, plain text explanation and likely stage.";

function PubertyAnalysisScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <OnboardingLayout
      title="Optional Tanner Stage Analysis"
      currentStep={10}
      onNext={onNext}
      onBack={onBack}
      nextButtonText="Continue"
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <AnalysisCard
          endpoint="https://foodanalyzer-2og6xa3ima-uc.a.run.app"
          prompt={TANNER_ANALYSIS_PROMPT}
          analyzeButtonText="Analyze Image"
          maxImages={1}
          placeholderText="Upload one photo"
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

export default withOnboarding(PubertyAnalysisScreen, 18, "analysis", "product");

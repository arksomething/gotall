import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function AcneScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<
    "none" | "few" | "regular" | "severe" | "cleared" | null
  >(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_acneSeverity) {
      setAnswer(userData.puberty_acneSeverity);
    }
  }, [userData.puberty_acneSeverity]);

  return (
    <OnboardingLayout
      title="Do you get acne?"
      currentStep={5}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText="Continue"
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: "None", value: "none" },
            { label: "Just a few sometimes", value: "few" },
            { label: "Regular acne", value: "regular" },
            { label: "Frequent/severe acne", value: "severe" },
            { label: "Mostly cleared", value: "cleared" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as
              | "none"
              | "few"
              | "regular"
              | "severe"
              | "cleared";
            setAnswer(v);
            try {
              await updateUserData({ puberty_acneSeverity: v });
            } catch {}
          }}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

export default withOnboarding(AcneScreen, 13, "acne", "muscles");

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function ShaveScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"no" | "sometimes" | "regularly" | null>(
    null
  );
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_shaveFrequency) {
      setAnswer(userData.puberty_shaveFrequency);
    }
  }, [userData.puberty_shaveFrequency]);

  return (
    <OnboardingLayout
      title="Do you shave facial hair?"
      currentStep={9}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText="Continue"
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: "No", value: "no" },
            { label: "Yes, sometimes", value: "sometimes" },
            { label: "Yes, regularly", value: "regularly" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "no" | "sometimes" | "regularly";
            setAnswer(v);
            try {
              await updateUserData({ puberty_shaveFrequency: v });
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

export default withOnboarding(ShaveScreen, 17, "shave", "analysis");

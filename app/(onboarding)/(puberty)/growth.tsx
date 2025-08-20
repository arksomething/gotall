import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function GrowthScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<
    "lt2" | "2to5" | "6to9" | "10plus" | null
  >(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_growthLastYear) {
      setAnswer(userData.puberty_growthLastYear);
    }
  }, [userData.puberty_growthLastYear]);

  return (
    <OnboardingLayout
      title="How much taller did you grow in the last year?"
      currentStep={2}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText="Continue"
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: "< 2 cm", value: "lt2" },
            { label: "2–5 cm", value: "2to5" },
            { label: "6–9 cm", value: "6to9" },
            { label: "10+ cm", value: "10plus" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "lt2" | "2to5" | "6to9" | "10plus";
            setAnswer(v);
            try {
              await updateUserData({ puberty_growthLastYear: v });
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

export default withOnboarding(GrowthScreen, 10, "growth", "shoulders");

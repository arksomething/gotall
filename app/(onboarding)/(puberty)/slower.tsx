import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function SlowerScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"no" | "yes" | null>(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_stillGrowingSlower) {
      setAnswer(userData.puberty_stillGrowingSlower);
    }
  }, [userData.puberty_stillGrowingSlower]);

  return (
    <OnboardingLayout
      title="Are you still growing, but slower than last year?"
      currentStep={8}
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
            { label: "Yes", value: "yes" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "no" | "yes";
            setAnswer(v);
            try {
              await updateUserData({ puberty_stillGrowingSlower: v });
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

export default withOnboarding(SlowerScreen, 16, "slower", "shave");

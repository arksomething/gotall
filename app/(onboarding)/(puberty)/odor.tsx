import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function OdorScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"no" | "little" | "definitely" | null>(
    null
  );
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_bodyOdor) {
      setAnswer(userData.puberty_bodyOdor);
    }
  }, [userData.puberty_bodyOdor]);

  return (
    <OnboardingLayout
      title="Have you noticed more body odor?"
      currentStep={4}
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
            { label: "A little", value: "little" },
            { label: "Definitely stronger", value: "definitely" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "no" | "little" | "definitely";
            setAnswer(v);
            try {
              await updateUserData({ puberty_bodyOdor: v });
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

export default withOnboarding(OdorScreen, 12, "odor", "acne");

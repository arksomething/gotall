import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function FacialScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<
    "none" | "faint" | "sometimes" | "regular" | null
  >(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_facialHair) {
      setAnswer(userData.puberty_facialHair);
    }
  }, [userData.puberty_facialHair]);

  return (
    <OnboardingLayout
      title="Do you have facial hair?"
      currentStep={1}
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
            { label: "Just faint", value: "faint" },
            { label: "Shave sometimes", value: "sometimes" },
            { label: "Shave regularly/full beard", value: "regular" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "none" | "faint" | "sometimes" | "regular";
            setAnswer(v);
            try {
              await updateUserData({ puberty_facialHair: v });
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
  // Button styles are encapsulated in SelectionList
});

export default withOnboarding(FacialScreen, 9, "facial", "growth");

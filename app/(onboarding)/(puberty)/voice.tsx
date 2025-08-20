import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import { useUserData } from "../../../utils/UserContext";

function VoiceScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"nochange" | "somewhat" | "full" | null>(
    null
  );
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_voiceDepth) {
      setAnswer(userData.puberty_voiceDepth);
    }
  }, [userData.puberty_voiceDepth]);

  return (
    <OnboardingLayout
      title="Has your voice fully deepened?"
      currentStep={7}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText="Continue"
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: "No change", value: "nochange" },
            { label: "Somewhat deeper", value: "somewhat" },
            { label: "Fully deep/stable", value: "full" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "nochange" | "somewhat" | "full";
            setAnswer(v);
            try {
              await updateUserData({ puberty_voiceDepth: v });
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

export default withOnboarding(VoiceScreen, 15, "voice", "slower");

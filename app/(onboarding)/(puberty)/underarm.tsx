import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import i18n from "../../../utils/i18n";
import { useUserData } from "../../../utils/UserContext";

function UnderarmScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"no" | "yes" | null>(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_underarmHair) {
      setAnswer(userData.puberty_underarmHair);
    }
  }, [userData.puberty_underarmHair]);

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:underarm_title")}
      currentStep={0}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText={i18n.t("onboarding:subscription_button_continue", {
        defaultValue: "Continue",
      })}
      totalStepsOverride={CONFIG.PUBERTY_QUIZ_STEPS}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: i18n.t("onboarding:underarm_option_no"), value: "no" },
            { label: i18n.t("onboarding:underarm_option_yes"), value: "yes" },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "no" | "yes";
            setAnswer(v);
            try {
              await updateUserData({ puberty_underarmHair: v });
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

export default withOnboarding(UnderarmScreen, 8, "underarm", "facial");

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import i18n from "../../../utils/i18n";
import { useUserData } from "../../../utils/UserContext";

function ShouldersScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<"no" | "starting" | "broader" | null>(
    null
  );
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_shouldersBroadening) {
      setAnswer(userData.puberty_shouldersBroadening);
    }
  }, [userData.puberty_shouldersBroadening]);

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:shoulders_title")}
      currentStep={3}
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
            { label: i18n.t("onboarding:shoulders_option_no"), value: "no" },
            {
              label: i18n.t("onboarding:shoulders_option_starting"),
              value: "starting",
            },
            {
              label: i18n.t("onboarding:shoulders_option_broader"),
              value: "broader",
            },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "no" | "starting" | "broader";
            setAnswer(v);
            try {
              await updateUserData({ puberty_shouldersBroadening: v });
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

export default withOnboarding(ShouldersScreen, 11, "shoulders", "odor");

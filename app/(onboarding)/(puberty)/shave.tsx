import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import { CONFIG } from "../../../utils/config";
import i18n from "../../../utils/i18n";
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
      title={i18n.t("onboarding:shave_title")}
      currentStep={9}
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
            { label: i18n.t("onboarding:shave_option_no"), value: "no" },
            {
              label: i18n.t("onboarding:shave_option_sometimes"),
              value: "sometimes",
            },
            {
              label: i18n.t("onboarding:shave_option_regularly"),
              value: "regularly",
            },
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

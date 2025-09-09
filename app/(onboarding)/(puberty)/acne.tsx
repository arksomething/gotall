import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import i18n from "../../../utils/i18n";
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
      title={i18n.t("onboarding:acne_title")}
      onNext={onNext}
      onBack={onBack}
      disableDefaultNext={!answer}
      nextButtonText={i18n.t("onboarding:subscription_button_continue", {
        defaultValue: "Continue",
      })}
    >
      <View style={styles.container}>
        <SelectionList
          options={[
            { label: i18n.t("onboarding:acne_option_none"), value: "none" },
            { label: i18n.t("onboarding:acne_option_few"), value: "few" },
            {
              label: i18n.t("onboarding:acne_option_regular"),
              value: "regular",
            },
            { label: i18n.t("onboarding:acne_option_severe"), value: "severe" },
            {
              label: i18n.t("onboarding:acne_option_cleared"),
              value: "cleared",
            },
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

export default withOnboarding(AcneScreen, "acne");

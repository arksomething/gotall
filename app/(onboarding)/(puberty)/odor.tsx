import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import i18n from "../../../utils/i18n";
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
      title={i18n.t("onboarding:odor_title")}
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
            { label: i18n.t("onboarding:odor_option_no"), value: "no" },
            { label: i18n.t("onboarding:odor_option_little"), value: "little" },
            {
              label: i18n.t("onboarding:odor_option_definitely"),
              value: "definitely",
            },
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

export default withOnboarding(OdorScreen, "odor");

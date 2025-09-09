import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import i18n from "../../../utils/i18n";
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
      title={i18n.t("onboarding:facial_title")}
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
            { label: i18n.t("onboarding:facial_option_none"), value: "none" },
            { label: i18n.t("onboarding:facial_option_faint"), value: "faint" },
            {
              label: i18n.t("onboarding:facial_option_sometimes"),
              value: "sometimes",
            },
            {
              label: i18n.t("onboarding:facial_option_regular"),
              value: "regular",
            },
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

export default withOnboarding(FacialScreen, "facial");

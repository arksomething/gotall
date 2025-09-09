import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../../components/OnboardingLayout";
import { SelectionList } from "../../../components/SelectionList";
import { withOnboarding } from "../../../components/withOnboarding";
import i18n from "../../../utils/i18n";
import { useUserData } from "../../../utils/UserContext";

function GrowthScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [answer, setAnswer] = useState<
    "lt2" | "2to5" | "6to9" | "10plus" | null
  >(null);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    if (!answer && userData.puberty_growthLastYear) {
      setAnswer(userData.puberty_growthLastYear);
    }
  }, [userData.puberty_growthLastYear]);

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:growth_title")}
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
            { label: i18n.t("onboarding:growth_option_lt2"), value: "lt2" },
            { label: i18n.t("onboarding:growth_option_2to5"), value: "2to5" },
            { label: i18n.t("onboarding:growth_option_6to9"), value: "6to9" },
            {
              label: i18n.t("onboarding:growth_option_10plus"),
              value: "10plus",
            },
          ]}
          selectedValue={answer ?? undefined}
          onSelect={async (value) => {
            const v = value as "lt2" | "2to5" | "6to9" | "10plus";
            setAnswer(v);
            try {
              await updateUserData({ puberty_growthLastYear: v });
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

export default withOnboarding(GrowthScreen, "growth");

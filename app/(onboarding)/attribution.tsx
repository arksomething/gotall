import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionList } from "../../components/SelectionList";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { logEvent } from "../../utils/Analytics";
import { setUserProperty } from "../../utils/FirebaseAnalytics";
import i18n from "../../utils/i18n";
import { getJsonArrayParam } from "../../utils/remoteConfig";
import { useOnboarding } from "./_layout";

function AttributionScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { attribution, setAttribution } = useOnboarding();

  const fallbackOptions = [
    "Kevin Liu",
    "DanielHowToGrow",
    "Mogg3d",
    "GoTallWithTaylor",
    "Height Wizard",
    "Other",
  ];

  const attributionOptions = getJsonArrayParam(
    "onboarding_attribution_options_json",
    fallbackOptions
  );

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:attribution_title", "Where did you come from?")}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <SelectionList
          options={attributionOptions}
          selectedValue={attribution}
          onSelect={async (value) => {
            // Local debug logging in dev builds for Windows/dev client workflows
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log("[ATTRIBUTION] selected", value);
            }
            try {
              await setUserProperty("attribution", value || null);
              logEvent("onboarding_attribution_select", { attribution: value });
            } catch {}
            setAttribution(value);
          }}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    width: "100%",
  },
});

export default withOnboarding(AttributionScreen, "attribution");

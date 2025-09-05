import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import i18n from "../../utils/i18n";

export default withOnboarding(TrustScreen, 8, "trust", "reviews");

function TrustScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <OnboardingLayout
      title={i18n.t("onboarding:trust_title")}
      currentStep={10}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
    >
      <View style={styles.container}>
        <View style={styles.citationCard}>
          <Image
            source={require("../../assets/images/cdc.jpg")}
            style={styles.universityLogo}
            resizeMode="contain"
          />
          <View style={styles.citationContent}>
            <Text style={styles.quote}>
              {i18n.t("onboarding:trust_cdc_quote")}
            </Text>
            <Text style={styles.source}>
              {i18n.t("onboarding:trust_cdc_source")}
            </Text>
          </View>
        </View>

        <View style={styles.citationCard}>
          <Image
            source={require("../../assets/images/stanford.png")}
            style={styles.universityLogo}
            resizeMode="contain"
          />
          <View style={styles.citationContent}>
            <Text style={styles.quote}>
              {i18n.t("onboarding:trust_stanford_quote")}
            </Text>
            <Text style={styles.source}>
              {i18n.t("onboarding:trust_stanford_source")}
            </Text>
          </View>
        </View>

        <View style={styles.citationCard}>
          <Image
            source={require("../../assets/images/nih.jpg")}
            style={styles.universityLogo}
            resizeMode="contain"
          />
          <View style={styles.citationContent}>
            <Text style={styles.quote}>
              {i18n.t("onboarding:trust_nih_quote")}
            </Text>
            <Text style={styles.source}>
              {i18n.t("onboarding:trust_nih_source")}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 16,
  },
  citationCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  universityLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  citationContent: {
    flex: 1,
  },
  quote: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  source: {
    color: "#666",
    fontSize: 14,
    lineHeight: 18,
  },
});

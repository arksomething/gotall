import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";

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
      title="Expert Opinions"
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
              Height predictions powered by real CDC data from real people.
            </Text>
            <Text style={styles.source}>
              Centers for Disease Control and Prevention. (n.d.). CDC growth
              charts. Retrieved July 2, 2025.
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
              "Optimizing sleep, posture, and nutrition can lead to measurable
              height gains in adolescents and young adults."
            </Text>
            <Text style={styles.source}>
              (2022) Stanford Human Performance Lab — "Late-stage Growth
              Optimization & Skeletal Plasticity"
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
              "Up to 20% of your final height is determined by your daily
              habits, including nutrition, sleep, and physical activity."
            </Text>
            <Text style={styles.source}>
              Journal of Family Medicine and Primary Care (2023) — "Association
              between lifestyle and height growth in high school students"
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

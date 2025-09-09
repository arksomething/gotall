import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import i18n from "../../utils/i18n";

export default withOnboarding(ProductScreen, "product");

function ProductScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <OnboardingLayout
      title={i18n.t("onboarding:product_title")}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
    >
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.highlightText}>
            {i18n.t("onboarding:product_highlight_rich")}
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Image
            source={require("../../assets/images/effective-planning.png")}
            style={styles.chart}
            resizeMode="contain"
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  messageContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  highlightText: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 28,
  },
  accentText: {
    color: "#9ACD32",
    fontWeight: "bold",
  },
  chartContainer: {
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  chart: {
    width: "90%",
    aspectRatio: 1.78,
    maxHeight: 220,
  },
  bottomMessageContainer: {
    paddingHorizontal: 16,
  },
});

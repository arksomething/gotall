import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import i18n from "../../utils/i18n";
import { useOnboarding } from "./_layout";

function SexScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { sex, setSex } = useOnboarding();

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:sex_title")}
      currentStep={2}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="male-female-outline" size={80} color="#9ACD32" />
        </View>
        <View style={styles.sexSelector}>
          <TouchableOpacity
            style={[styles.sexButton, sex === "1" && styles.sexButtonActive]}
            onPress={() => setSex("1")}
          >
            <Ionicons
              name="man-outline"
              size={40}
              color={sex === "1" ? "#000" : "#9ACD32"}
            />
            <Text style={[styles.sexText, sex === "1" && styles.sexTextActive]}>
              {i18n.t("onboarding:sex_option_male")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sexButton, sex === "2" && styles.sexButtonActive]}
            onPress={() => setSex("2")}
          >
            <Ionicons
              name="woman-outline"
              size={40}
              color={sex === "2" ? "#000" : "#9ACD32"}
            />
            <Text style={[styles.sexText, sex === "2" && styles.sexTextActive]}>
              {i18n.t("onboarding:sex_option_female")}
            </Text>
          </TouchableOpacity>
        </View>
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
  iconContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  sexSelector: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  sexButton: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: 160,
    borderWidth: 2,
    borderColor: "#333",
  },
  sexButtonActive: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  sexText: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  sexTextActive: {
    color: "#000",
  },
});

export default withOnboarding(SexScreen, 2, "sex");

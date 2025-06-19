import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";

function WelcomeScreen({ onNext }: OnboardingScreenProps) {
  return (
    <OnboardingLayout
      title="Welcome to GoTall"
      currentStep={0}
      onNext={onNext}
      showBackButton={false}
    >
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="hand-right-outline" size={80} color="#9ACD32" />
        </View>
        <Text style={styles.welcomeText}>
          Track your posture, build better habits, and improve your health with
          comprehensive tracking and family genetics insights.
        </Text>
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
  welcomeText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 16,
    maxWidth: 500,
  },
});

export default withOnboarding(WelcomeScreen, 0, "index");

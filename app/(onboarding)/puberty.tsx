import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";

function PubertyIntroScreen({ onBack, onNext }: OnboardingScreenProps) {
  const router = useRouter();

  const handleTake = () => {
    router.push("/(onboarding)/(puberty)/underarm" as any);
  };

  const handleSkip = () => {
    router.push("/(onboarding)/product" as any);
  };

  return (
    <OnboardingLayout
      title="Optional Puberty Questionnaire"
      currentStep={8}
      onBack={onBack}
      onNext={onNext}
      nextButtonText="Take Quiz"
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>About 5 minutes</Text>
        <Text style={styles.description}>
          You can take a short, optional questionnaire to help determine whether
          you've likely entered puberty. This can improve personalization.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.takeButton} onPress={handleTake}>
            <Text style={styles.takeText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
  },
  subtitle: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  takeButton: {
    flex: 1,
    backgroundColor: "#9ACD32",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  takeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default withOnboarding(PubertyIntroScreen, 8, "puberty", "underarm");

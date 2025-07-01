import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { withOnboarding } from "../../components/withOnboarding";
import { parseHeightToCm } from "../../utils/heightUtils";
import { useOnboarding } from "./_layout";

export default withOnboarding(GeneratingScreen, 6, "generating", "projection");

function GeneratingScreen({ onNext }: { onNext?: () => void }) {
  const router = useRouter();
  const {
    dateOfBirth,
    sex,
    height,
    weight,
    motherHeight,
    fatherHeight,
    ethnicity,
    preferredHeightUnit,
    preferredWeightUnit,
    setIsGenerating,
    updateUserData,
  } = useOnboarding();

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        const heightInCm = parseHeightToCm(
          height,
          preferredHeightUnit as "ft" | "cm"
        );

        // Simulate profile generation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        await updateUserData({
          heightCm: heightInCm,
          dateOfBirth: dateOfBirth.toISOString().split("T")[0],
          sex,
          weight: parseFloat(weight) || 0,
          motherHeightCm: parseHeightToCm(
            motherHeight,
            preferredHeightUnit as "ft" | "cm"
          ),
          fatherHeightCm: parseHeightToCm(
            fatherHeight,
            preferredHeightUnit as "ft" | "cm"
          ),
          ethnicity,
          preferredWeightUnit: preferredWeightUnit as "lbs" | "kg",
          preferredHeightUnit: preferredHeightUnit as "ft" | "cm",
        });

        // Move to projection screen without invoking onNext (avoids haptic)
        router.push("/(onboarding)/projection" as any);
      } catch (error) {
        setIsGenerating(false);
        router.back();
        console.error("Onboarding save error:", error);
      }
    };

    completeOnboarding();
  }, []);

  const handleBack = () => {
    setIsGenerating(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <TouchableOpacity style={styles.backArrow} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.loadingTitle}>
          Generating your custom{"\n"}profile based on data{"\n"}you've
          provided...
        </Text>
        <View style={styles.loadingIconContainer}>
          <Ionicons name="trending-up" size={48} color="#9ACD32" />
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backArrow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 12 : 16,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  loadingTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 36,
  },
  loadingIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(154, 205, 50, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 3,
  },
  loadingSubtext: {
    color: "#666",
    fontSize: 14,
  },
});

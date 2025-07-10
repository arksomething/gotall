import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { withOnboarding } from "../../components/withOnboarding";
import { logEvent } from "../../utils/Analytics";
import { parseHeightToCm } from "../../utils/heightUtils";
import { useOnboarding } from "./_layout";

export default withOnboarding(GeneratingScreen, 11, "generating", "projection");

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

  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = [
    "You didn't choose your genetics.",
    "But you can choose what you do.",
    "Analyzing the CDC data...",
    "Finding your height coach...",
  ];

  useEffect(() => {
    if (currentMessageIndex >= messages.length) return;

    const message = messages[currentMessageIndex];
    let currentCharIndex = 0;

    typingIntervalRef.current = setInterval(async () => {
      if (currentCharIndex <= message.length) {
        setDisplayText((prev) => {
          const lines = prev.split("\n");
          lines[currentMessageIndex] = message.slice(0, currentCharIndex);
          return lines.join("\n");
        });

        if (currentCharIndex > 0) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        currentCharIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
          }
        }, 1000);
      }
    }, 30);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [currentMessageIndex]);

  useEffect(() => {
    const LOADING_DURATION = 8500;

    // Start progress bar animation
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: LOADING_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();

    const completeOnboarding = async () => {
      try {
        const heightInCm = parseHeightToCm(
          height,
          preferredHeightUnit as "ft" | "cm"
        );

        // Wait for the exact same duration as the progress bar
        loadingTimeoutRef.current = setTimeout(async () => {
          // Log gender selection once here
          try {
            logEvent("onboarding_gender_select", {
              gender: sex === "1" ? "male" : sex === "2" ? "female" : "other",
            });
          } catch (e) {
            console.warn("Failed to log gender analytics", e);
          }

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
          router.push("/(onboarding)/results" as any);
        }, LOADING_DURATION);
      } catch (error) {
        setIsGenerating(false);
        router.replace("/(onboarding)/short");
        console.error("Onboarding save error:", error);
      }
    };

    completeOnboarding();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      animation.stop();
    };
  }, []);

  const handleBack = () => {
    // Clear all timeouts and intervals
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    // Stop the animation
    progressAnim.stopAnimation();
    setIsGenerating(false);
    router.replace("/(onboarding)/reviews");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </View>
        </Pressable>
        <Text style={styles.loadingTitle}>
          {displayText}
          <Text style={styles.cursor}>|</Text>
        </Text>
        <View style={styles.loadingIconContainer}>
          <Ionicons name="trending-up" size={48} color="#9ACD32" />
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
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
  backButton: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 36,
  },
  cursor: {
    opacity: 1,
    color: "#9ACD32",
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
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 3,
  },
  loadingSubtext: {
    color: "#666",
    fontSize: 14,
  },
});

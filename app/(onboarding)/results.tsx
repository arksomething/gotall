import convert from "convert-units";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { findSurroundingPercentiles } from "../../utils/heightProjection";
import { useOnboarding } from "./_layout";

function ResultsScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { height, dateOfBirth, sex, units } = useOnboarding();
  const [displayText, setDisplayText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    "Analyzing your data...",
  ]);

  useEffect(() => {
    // Check for completion after messages are done
    const checkComplete = setInterval(() => {
      if (currentMessageIndex === messages.length - 1) {
        setIsComplete(true);
        clearInterval(checkComplete);
      }
    }, 100);

    return () => clearInterval(checkComplete);
  }, [messages.length, currentMessageIndex]);

  useEffect(() => {
    if (height && sex && dateOfBirth) {
      try {
        // Convert height string to cm
        let heightCm: number;
        if (units === "metric") {
          heightCm = parseInt(height.split(" ")[0]);
        } else {
          // Convert from "5 ft 7 in" format
          const [feet, inches] = height.split(" ft ");
          const totalInches = parseInt(feet) * 12 + parseInt(inches);
          heightCm = Math.round(convert(totalInches).from("in").to("cm"));
        }

        // Calculate age in years
        const ageYears = Math.min(
          (new Date().getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
          20 // Cap at 20 years
        );

        const result = findSurroundingPercentiles(heightCm, ageYears, sex);

        let resultMessages: string[];

        if (
          (result.exactPercentile && result.exactPercentile < 50) ||
          (result.upperPercentile && result.upperPercentile < 50)
        ) {
          resultMessages = [
            "Your results are in!",
            "Let's see how you did!",
            "It turns out...",
            "You're short.",
            "But that's about to change.",
          ];
        } else if (
          (result.exactPercentile && result.exactPercentile > 90) ||
          (result.lowerPercentile && result.lowerPercentile > 90)
        ) {
          resultMessages = [
            "Your results are in!",
            "Let's see how you did!",
            "It turns out...",
            "You're tall!",
            "Now, let's see how you can grow even more.",
          ];
        } else {
          resultMessages = [
            "Your results are in!",
            "Let's see how you did!",
            "It turns out...",
            "You're right where you need to be.",
            "Now, let's see how you can grow even more.",
          ];
        }

        setMessages(resultMessages);
      } catch (error) {
        console.error("Error calculating percentile:", error);
        setMessages([
          "Your results are in!",
          "Let's see how you did!",
          "It turns out...",
          "You're short.",
          "But that's about to change.",
        ]);
      }
    }
  }, [height, sex, dateOfBirth, units]);

  useEffect(() => {
    if (currentMessageIndex >= messages.length) return;

    const message = messages[currentMessageIndex];
    let currentCharIndex = 0;

    const typingInterval = setInterval(async () => {
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
        clearInterval(typingInterval);
        setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
          }
        }, 1000);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages]);

  return (
    <OnboardingLayout
      title="Your Results"
      currentStep={12}
      onNext={isComplete ? onNext : undefined}
      onBack={onBack}
    >
      <View style={styles.container}>
        <Text style={styles.loadingTitle}>
          {displayText}
          <Text style={styles.cursor}>|</Text>
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 36,
  },
  cursor: {
    opacity: 1,
    color: "#9ACD32",
  },
});

export default withOnboarding(ResultsScreen, 11, "results");

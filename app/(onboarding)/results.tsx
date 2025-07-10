import convert from "convert-units";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { findSurroundingPercentiles } from "../../utils/heightProjection";
import { useOnboarding } from "./_layout";

function ResultsScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { height, dateOfBirth, sex, units, ethnicity } = useOnboarding();
  const [displayText, setDisplayText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    "Analyzing your data...",
  ]);

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
            "It turns out...",
            "You're not growing at your potential.",
            "But that's about to change.",
            "We've found Andy, your personal height coach.",
          ];
        } else if (
          (result.exactPercentile && result.exactPercentile > 90) ||
          (result.lowerPercentile && result.lowerPercentile > 90)
        ) {
          resultMessages = [
            "Your results are in!",
            "It turns out...",
            "You're growing well!",
            "We've found Andy, your personal height coach.",
          ];
        } else {
          resultMessages = [
            "Your results are in!",
            "It turns out...",
            "You're right where you need to be.",
            "We've found Andy, your personal height coach.",
          ];
        }

        // Personalised final line
        const ageInt = Math.floor(ageYears);
        const sexText = sex === "1" ? "males" : "females";
        const normalizeEthnicity = (val: string): string => {
          switch (val.toLowerCase()) {
            case "caucasian":
              return "caucasians";
            case "african american":
              return "african americans";
            case "hispanic/latino":
              return "latinos";
            case "asian":
              return "asians";
            case "native american":
              return "native americans";
            case "pacific islander":
              return "pacific islanders";
            case "mixed/other":
              return "mixed backgrounds";
            default:
              return val.toLowerCase();
          }
        };

        const ethnicitySegment = ethnicity
          ? normalizeEthnicity(ethnicity)
          : sexText;
        resultMessages.push(
          `Andy has helped other ${ageInt} year old ${ethnicitySegment} maximize their height.`
        );

        setMessages(resultMessages);
      } catch (error) {
        console.error("Error calculating percentile:", error);
        setMessages([
          "Your results are in!",
          "It turns out...",
          "You're not growing at your potential.",
          "But that's about to change.",
          "We've found Andy, your personal height coach.",
          "He'll help you maximize your height potential.",
        ]);
      }
    }
  }, [height, sex, dateOfBirth, units, ethnicity]);

  useEffect(() => {
    if (currentMessageIndex >= messages.length || isSkipped) return;

    const message = messages[currentMessageIndex];
    let currentCharIndex = 0;

    const typingInterval = setInterval(async () => {
      if (isSkipped) {
        clearInterval(typingInterval);
        return;
      }

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
          } else {
            setIsComplete(true);
          }
        }, 1000);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, isSkipped]);

  const skipTyping = () => {
    // Stop typing animation and show all messages immediately
    setIsSkipped(true);
    setDisplayText(messages.join("\n"));
    setCurrentMessageIndex(messages.length);
    setIsComplete(true);
  };

  const handleNext = () => {
    // stop any pending haptic/typing
    skipTyping();
    onNext?.();
  };

  return (
    <OnboardingLayout
      title="Your Results"
      currentStep={12}
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.textContainer}
          onPress={skipTyping}
          activeOpacity={0.8}
        >
          <Text style={styles.loadingTitle}>
            {displayText}
            <Text style={styles.cursor}>|</Text>
          </Text>
        </TouchableOpacity>
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
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

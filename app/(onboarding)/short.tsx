import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";

export default withOnboarding(ShortScreen, 11, "short", "generating");

function ShortScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const screenWidth = Dimensions.get("window").width;
  // Start from off the right side of the screen
  const slideAnims = [
    useRef(new Animated.Value(screenWidth)),
    useRef(new Animated.Value(screenWidth)),
    useRef(new Animated.Value(screenWidth)),
    useRef(new Animated.Value(screenWidth)),
    useRef(new Animated.Value(screenWidth)),
    useRef(new Animated.Value(screenWidth)),
  ];

  useEffect(() => {
    // Animate each card with a staggered delay
    slideAnims.forEach((anim, index) => {
      Animated.timing(anim.current, {
        toValue: 0,
        duration: 150, // Reduced from 500ms to 300ms
        delay: index * 30, // Reduced from 100ms to 50ms delay between each card
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnims]);

  const costItems = [
    "40% fewer dating matches",
    "Ignored in rooms that matter",
    "Not taken seriously by others",
    "59% less likely to be CEO under 5'9\"",
    "Each inch costs $600/year",
    "More social anxiety",
  ];

  return (
    <OnboardingLayout
      title="The Cost of Being Short"
      currentStep={11}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
    >
      <View style={styles.container}>
        {costItems.map((text, index) => (
          <Animated.View
            key={text}
            style={[
              styles.costItem,
              {
                transform: [{ translateX: slideAnims[index].current }],
              },
            ]}
          >
            <Pressable style={styles.costItemInner}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#9ACD32"
              />
              <Text style={styles.costText}>{text}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 12,
  },
  costItem: {
    backgroundColor: "#111",
    borderRadius: 16,
  },
  costItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  costText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
});

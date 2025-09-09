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
import i18n from "../../utils/i18n";

export default withOnboarding(ShortScreen, "short");

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
    i18n.t("onboarding:short_cost_item_1"),
    i18n.t("onboarding:short_cost_item_2"),
    i18n.t("onboarding:short_cost_item_3"),
    i18n.t("onboarding:short_cost_item_4"),
    i18n.t("onboarding:short_cost_item_5"),
    i18n.t("onboarding:short_cost_item_6"),
  ];

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:short_title")}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
      nextButtonText={i18n.t("onboarding:short_button_next")}
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

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useSegments } from "expo-router";
import React from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "../app/(onboarding)/_layout";
import i18n from "../utils/i18n";
import { logger } from "../utils/Logger";
import { getProgressTotals, OnboardingRoute } from "../utils/onboardingFlow";
import { PickerErrorBoundary } from "./PickerErrorBoundary";

// Progress derived from manifest

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
  centerContent?: boolean;
  disableDefaultNext?: boolean;
  nextButtonStyle?: object;
  hideFooter?: boolean;
  hideHeader?: boolean;
  containerBgColor?: string;
}

export function OnboardingLayout({
  children,
  title,
  showBackButton = true,
  onBack,
  onNext,
  nextButtonText = i18n.t("onboarding:subscription_button_continue"),
  centerContent = false,
  disableDefaultNext = false,
  nextButtonStyle,
  hideFooter = false,
  hideHeader = false,
  containerBgColor = "#000",
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const segments = useSegments();
  const onboarding = useOnboarding();

  // Determine which flow we're in for progress bar defaults
  // Derive current route name from segments (last non-group segment)
  const currentRoute: OnboardingRoute | undefined = React.useMemo(() => {
    try {
      const list = (segments || []).filter(
        (s) => typeof s === "string" && !String(s).startsWith("(")
      ) as string[];
      const name = list[list.length - 1];
      return name as OnboardingRoute | undefined;
    } catch {
      return undefined;
    }
  }, [segments]);

  // Compute progress percent and index strictly from manifest
  const { percent: manifestPercent, index: manifestIndex } =
    React.useMemo(() => {
      try {
        if (currentRoute) {
          const { percent, index } = getProgressTotals(
            currentRoute,
            onboarding as any
          );
          return { percent, index };
        }
      } catch {}
      return { percent: 0, index: 0 } as any;
    }, [currentRoute, onboarding]);

  const animateScale = (toValue: number) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  // Track onboarding screen view
  React.useEffect(() => {
    logger.trackScreen(title, { group: "onboarding" });
  }, [title]);

  // Track dwell time per onboarding screen using route segments as a stable id
  const screenId = React.useMemo(() => {
    try {
      return (segments || []).join("/") || "onboarding";
    } catch {
      return "onboarding";
    }
  }, [segments]);

  useFocusEffect(
    React.useCallback(() => {
      const key = `screen_${screenId}`;
      logger.startTimer(key, { group: "onboarding", step: manifestIndex });
      return () => {
        logger.endTimer(key, { group: "onboarding", step: manifestIndex });
      };
    }, [screenId, manifestIndex])
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: containerBgColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {!hideHeader && (
          <View style={styles.header}>
            {showBackButton && onBack && (
              <Pressable
                style={styles.backButton}
                onPressIn={() => animateScale(0.9)}
                onPressOut={() => animateScale(1)}
                onPress={onBack}
              >
                <Animated.View
                  style={[
                    styles.backButtonCircle,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </Animated.View>
              </Pressable>
            )}

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${manifestPercent || 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {!hideHeader && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[
            styles.scrollContentContainer,
            centerContent && styles.centerContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PickerErrorBoundary>{children}</PickerErrorBoundary>
        </ScrollView>
        {!hideFooter && (
          <View
            style={[
              styles.footer,
              {
                paddingBottom:
                  Math.max(insets.bottom, 16) +
                  (Platform.OS === "android" ? 12 : 0),
              },
            ]}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.nextButton, nextButtonStyle]}
                onPress={disableDefaultNext ? undefined : onNext}
              >
                <Text style={styles.nextButtonText}>{nextButtonText}</Text>
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  progressContainer: {
    flex: 1,
    paddingVertical: 24,
  },
  backButton: {
    alignSelf: "center",
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bottomBackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#999",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: "#9ACD32",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    flex: 1,
    justifyContent: "center",
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
});

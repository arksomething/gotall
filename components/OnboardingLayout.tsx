import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TOTAL_STEPS = 8;

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  showBackButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
  centerContent?: boolean;
  disableDefaultNext?: boolean;
  nextButtonStyle?: object;
}

export function OnboardingLayout({
  children,
  title,
  currentStep,
  showBackButton = true,
  onBack,
  onNext,
  nextButtonText = "Continue",
  centerContent = false,
  disableDefaultNext = false,
  nextButtonStyle,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {showBackButton && onBack && (
            <TouchableOpacity style={styles.backArrow} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.progressContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[
            styles.scrollContentContainer,
            centerContent && styles.centerContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

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
            {showBackButton && onBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="chevron-back" size={20} color="#666" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !showBackButton && styles.nextButtonFullWidth,
                nextButtonStyle,
              ]}
              onPress={disableDefaultNext ? undefined : onNext}
            >
              <Text style={styles.nextButtonText}>{nextButtonText}</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
  },
  backArrow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 12 : 16,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#9ACD32",
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
  backButton: {
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

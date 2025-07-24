import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LessonLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number; // 0-based index
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
}

export function LessonLayout({
  children,
  title,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextButtonText = "Next",
}: LessonLayoutProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animateScale = (to: number) => {
    Animated.spring(scaleAnim, {
      toValue: to,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {onBack && (
          <Pressable
            onPressIn={() => animateScale(0.9)}
            onPressOut={() => animateScale(1)}
            onPress={onBack}
            style={styles.backWrapper}
          >
            <Animated.View
              style={[styles.backCircle, { transform: [{ scale: scaleAnim }] }]}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Animated.View>
          </Pressable>
        )}

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / totalSteps) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.nextText}>{nextButtonText}</Text>
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  backWrapper: { alignSelf: "center" },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: { flex: 1, paddingVertical: 16 },
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
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 16,
    paddingBottom: 16,
  },
  nextBtn: {
    backgroundColor: "#9ACD32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 24,
  },
  nextText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
});

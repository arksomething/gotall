import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RoadmapNodeProps {
  diameter: number; // circle size
  completed: boolean;
  expanded: boolean;
  onPress: () => void; // toggle expand
  onToggleComplete: () => void; // mark/unmark complete
  onStartLessons?: () => void; // begin lessons
  children: React.ReactNode; // content inside circle
  label?: string;
  description?: React.ReactNode;
  day: number;
  onMeasure?: (day: number, y: number) => void;
  isUnlocked?: boolean; // whether the lesson is unlocked
}

const MAX_DIAMETER = 80;
const BASE_LEFT = 50;

export default function RoadmapNode({
  diameter,
  completed,
  expanded,
  onPress,
  onToggleComplete,
  children,
  label,
  description,
  day,
  onMeasure,
  onStartLessons,
  isUnlocked,
}: RoadmapNodeProps) {
  const computedMarginLeft = BASE_LEFT + (MAX_DIAMETER - diameter) / 2;

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <View
      style={[styles.container, { marginLeft: computedMarginLeft }]}
      onLayout={(e) => {
        onMeasure?.(day, e.nativeEvent.layout.y);
      }}
    >
      {expanded ? (
        <Pressable style={styles.card} onPress={handlePress}>
          <View style={styles.cardHeader}>
            <View style={styles.circleSmall}>{children}</View>
            {label ? <Text style={styles.cardTitle}>{label}</Text> : null}
          </View>
          <View style={styles.descriptionWrapper}>{description}</View>
          <View style={styles.buttonContainer}>
            {onStartLessons && (
              <TouchableOpacity
                style={[
                  styles.lessonButton,
                  !isUnlocked && styles.lessonButtonDisabled,
                ]}
                onPress={(e: GestureResponderEvent) => {
                  e.stopPropagation();
                  if (isUnlocked) {
                    onStartLessons();
                  }
                }}
                disabled={!isUnlocked}
              >
                {isUnlocked ? (
                  <>
                    <Ionicons name="play-outline" size={20} color="#000" />
                    <Text style={styles.lessonButtonText}>Start</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={20} color="#666" />
                    <Text
                      style={[
                        styles.lessonButtonText,
                        styles.lessonButtonTextDisabled,
                      ]}
                    >
                      Locked
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.completeButton,
                !isUnlocked && styles.completeButtonDisabled,
              ]}
              onPress={(e: GestureResponderEvent) => {
                e.stopPropagation();
                if (isUnlocked) {
                  onToggleComplete();
                }
              }}
              disabled={!isUnlocked}
            >
              <Text
                style={[
                  styles.completeButtonText,
                  !isUnlocked && styles.completeButtonTextDisabled,
                ]}
              >
                {completed ? "Unmark" : "Mark Done"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.circle,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                backgroundColor: completed ? "#9ACD32" : "#666",
              },
            ]}
            activeOpacity={0.8}
            onPress={handlePress}
          >
            <View style={styles.innerContent}>{children}</View>
          </TouchableOpacity>
          {label ? <Text style={styles.label}>{label}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "500",
  },
  descriptionBox: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    marginLeft: 100,
    marginTop: 8,
    maxWidth: 220,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 20,
  },
  completeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#9ACD32",
  },
  completeButtonText: {
    color: "#9ACD32",
    fontWeight: "600",
    fontSize: 14,
  },
  lessonButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9ACD32",
    borderRadius: 12,
    paddingVertical: 10,
  },
  lessonButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  circleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9ACD32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  card: {
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 14,
    width: "100%",
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  descriptionWrapper: {
    marginBottom: 10,
  },
  lessonButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#333",
  },
  lessonButtonTextDisabled: {
    color: "#666",
  },
  completeButtonDisabled: {
    opacity: 0.5,
    borderColor: "#666",
    borderWidth: 1,
  },
  completeButtonTextDisabled: {
    color: "#666",
  },
});

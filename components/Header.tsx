import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  showBackButton,
  onBack,
  rightElement,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.header, { paddingTop: insets.top + 8, paddingBottom: 20 }]}
    >
      {showBackButton ? (
        <TouchableOpacity
          onPress={onBack || router.back}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftPlaceholder} />
      )}
      <View style={styles.titleContainer}>
        {typeof title === "string" ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          title
        )}
      </View>
      {rightElement ? rightElement : <View style={styles.rightPlaceholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#000",
    minHeight: 44,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    margin: 4,
    textAlign: "center",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    padding: 4,
  },
  leftPlaceholder: {
    width: 32,
  },
  rightPlaceholder: {
    width: 32,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
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
    <View style={[styles.header, { paddingTop: insets.top }]}>
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
      <Text style={styles.title}>{title}</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    margin: 4,
    textAlign: "center",
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

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBackButton, onBack }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <>
          <TouchableOpacity onPress={onBack || router.back}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
    marginLeft: 8,
  },
  leftPlaceholder: {
    width: 24,
  },
});

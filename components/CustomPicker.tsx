import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafePicker } from "./SafePicker";

interface CustomPickerProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  containerStyle?: object;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <SafePicker
          selectedValue={selectedValue}
          onValueChange={(value) => onValueChange(value.toString())}
          dropdownIconColor="#9ACD32"
          mode="dropdown"
          style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
          items={items}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerWrapper: {
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    width: "100%",
  },
  picker: {
    backgroundColor: "#111",
    color: Platform.OS === "ios" ? "#fff" : "#9ACD32",
    width: "100%",
  },
  pickerIOS: {
    height: 200,
  },
});

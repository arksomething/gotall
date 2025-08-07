import React from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { SafePicker } from "./SafePicker";

type PickerItem = { label: string; value: string };

interface DualPickerProps {
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  onLeftValueChange: (value: string) => void;
  onRightValueChange: (value: string) => void;
  items: [PickerItem[], PickerItem[]] | PickerItem[];
  showUnits?: boolean;
  isMetric?: boolean;
  onUnitsChange?: (isMetric: boolean) => void;
}

export const DualPicker: React.FC<DualPickerProps> = ({
  title,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onLeftValueChange,
  onRightValueChange,
  items,
  showUnits = false,
  isMetric = false,
  onUnitsChange,
}) => {
  const [leftItems, rightItems] = Array.isArray(items[0])
    ? (items as [PickerItem[], PickerItem[]])
    : [items as PickerItem[], items as PickerItem[]];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.label}>{leftLabel}</Text>
          <View style={styles.pickerWrapper}>
            <SafePicker
              selectedValue={leftValue}
              onValueChange={onLeftValueChange}
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              items={leftItems}
            />
          </View>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.label}>{rightLabel}</Text>
          <View style={styles.pickerWrapper}>
            <SafePicker
              selectedValue={rightValue}
              onValueChange={onRightValueChange}
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              items={rightItems}
            />
          </View>
        </View>
      </View>

      {showUnits && onUnitsChange && (
        <View style={styles.unitsContainer}>
          <Text style={[styles.unitText, !isMetric && styles.activeUnit]}>
            Imperial
          </Text>
          <Switch
            value={isMetric}
            onValueChange={onUnitsChange}
            trackColor={{ false: "#333", true: "#9ACD32" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#333"
            style={styles.switch}
          />
          <Text style={[styles.unitText, isMetric && styles.activeUnit]}>
            Metric
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 32,
  },
  pickerColumn: {
    flex: 1,
  },
  label: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#9ACD32",
  },
  pickerWrapper: {
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  picker: {
    backgroundColor: "#111",
    color: Platform.OS === "ios" ? "#fff" : "#9ACD32",
  },
  pickerIOS: {
    height: 200,
  },
  unitsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  unitText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  activeUnit: {
    color: "#9ACD32",
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});

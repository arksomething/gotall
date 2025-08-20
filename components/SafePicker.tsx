import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface PickerItemOption {
  label: string;
  value: string;
  color?: string;
  enabled?: boolean;
}

interface SafePickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItemOption[];
  style?: any;
  itemStyle?: any;
  mode?: "dropdown" | "dialog";
  dropdownIconColor?: string;
  enabled?: boolean;
}

export const SafePicker: React.FC<SafePickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  style,
  itemStyle,
  mode = "dropdown",
  dropdownIconColor,
  enabled = true,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [safeSelectedValue, setSafeSelectedValue] = useState(selectedValue);
  const pickerRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted && selectedValue !== safeSelectedValue) {
      setSafeSelectedValue(selectedValue);
    }
  }, [selectedValue, isMounted, safeSelectedValue]);

  const handleValueChange = (value: string) => {
    if (isMounted) {
      setSafeSelectedValue(value);
      onValueChange(value);
    }
  };

  if (!isMounted || !enabled) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>
          {items.find((item) => item.value === selectedValue)?.label ||
            "Select..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        ref={pickerRef}
        selectedValue={safeSelectedValue}
        onValueChange={handleValueChange}
        mode={mode}
        dropdownIconColor={dropdownIconColor}
        style={[styles.picker, style]}
        itemStyle={itemStyle}
        enabled={enabled}
      >
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={item.color ?? (Platform.OS === "ios" ? "#fff" : "#9ACD32")}
            enabled={item.enabled}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  placeholder: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: Platform.OS === "ios" ? "#fff" : "#9ACD32",
    fontSize: 16,
  },
});

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Option = string | { label: string; value: string };

interface SelectionListProps {
  options: Option[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
}

export const SelectionList: React.FC<SelectionListProps> = ({
  options,
  selectedValue,
  onSelect,
  containerStyle,
}) => {
  const normalize = (
    option: Option | undefined | null
  ): { label: string; value: string } | null => {
    if (option == null) return null;
    if (typeof option === "string") {
      const text = option.trim();
      if (!text) return null;
      return { label: text, value: text };
    }
    const label = (option as any).label;
    const value = (option as any).value;
    if (typeof label !== "string" || typeof value !== "string") return null;
    return { label, value };
  };

  const safeOptions = (options || [])
    .map((opt) => normalize(opt))
    .filter((o): o is { label: string; value: string } => !!o);

  return (
    <View style={[styles.container, containerStyle]}>
      {safeOptions.map(({ label, value }) => {
        const isActive = selectedValue === value;
        return (
          <TouchableOpacity
            key={value}
            style={[styles.button, isActive && styles.buttonActive]}
            onPress={() => onSelect(value)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  textActive: {
    color: "#000",
  },
});

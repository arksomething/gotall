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
  const normalize = (option: Option) =>
    typeof option === "string" ? { label: option, value: option } : option;

  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((opt) => {
        const { label, value } = normalize(opt);
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

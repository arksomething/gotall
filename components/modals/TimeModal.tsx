import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimeOptions {
  start?: number;
  end?: number;
  increment?: number;
}

interface TimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newDuration: number) => void;
  initialValue: number; // duration in seconds
  timeOptions?: TimeOptions;
}

// Generate time options from 15 seconds to 5 minutes
const generateTimeOptions = (options?: TimeOptions) => {
  const { start = 15, end = 300, increment = 15 } = options || {};
  const opts = [];
  for (let i = start; i <= end; i += increment) {
    const minutes = Math.floor(i / 60);
    const seconds = i % 60;
    const label =
      (minutes > 0 ? `${minutes}m` : "") + (seconds > 0 ? ` ${seconds}s` : "");
    opts.push({ label: label.trim(), value: i.toString() });
  }
  return opts;
};

export const TimeModal: React.FC<TimeModalProps> = ({
  visible,
  onClose,
  onSave,
  initialValue,
  timeOptions,
}) => {
  const [tempValue, setTempValue] = useState(initialValue.toString());
  const options = useMemo(
    () => generateTimeOptions(timeOptions),
    [timeOptions]
  );

  useEffect(() => {
    setTempValue(initialValue.toString());
  }, [initialValue]);

  const handleSave = () => {
    onSave(parseInt(tempValue, 10));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Stretch Time</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tempValue}
              onValueChange={setTempValue}
              dropdownIconColor="#9ACD32"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
            >
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonTextPrimary}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerWrapper: {
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
  },
  picker: {
    backgroundColor: "#111",
    color: Platform.OS === "ios" ? "#fff" : "#9ACD32",
    width: "100%",
  },
  pickerIOS: {
    height: 200,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#333",
  },
  modalButtonPrimary: {
    backgroundColor: "#9ACD32",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtonTextPrimary: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

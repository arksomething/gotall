import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserData } from "../../utils/UserContext";

interface WeightModalProps {
  visible: boolean;
  onClose: () => void;
  initialValue: string;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  visible,
  onClose,
  initialValue,
}) => {
  const [tempValue, setTempValue] = React.useState(initialValue);
  const { updateUserData } = useUserData();

  React.useEffect(() => {
    setTempValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    const numericValue = parseFloat(tempValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid weight.");
      return;
    }

    try {
      await updateUserData({ weight: numericValue });
      onClose();
    } catch (error) {
      console.error("Error saving weight:", error);
      Alert.alert("Error", "Failed to save weight");
    }
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
          <Text style={styles.modalTitle}>Edit Weight</Text>
          <TextInput
            style={styles.modalInput}
            value={tempValue}
            onChangeText={setTempValue}
            placeholder="Enter weight"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
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
    marginBottom: 8,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
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

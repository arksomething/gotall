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
import { validateHeight } from "../../utils/heightUtils";

interface HeightModalProps {
  visible: boolean;
  onClose: () => void;
  initialValue: string;
}

export const HeightModal: React.FC<HeightModalProps> = ({
  visible,
  onClose,
  initialValue,
}) => {
  const [tempValue, setTempValue] = React.useState(initialValue);
  const { userData, updateUserData } = useUserData();

  React.useEffect(() => {
    setTempValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    const heightValidation = validateHeight(
      tempValue,
      userData.preferredHeightUnit
    );
    if (!heightValidation.isValid) {
      Alert.alert(
        "Invalid Input",
        heightValidation.errorMessage || "Please enter a valid height"
      );
      return;
    }

    try {
      await updateUserData({ heightCm: heightValidation.heightInCm! });
      onClose();
    } catch (error) {
      console.error("Error saving height:", error);
      Alert.alert("Error", "Failed to save height");
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
          <Text style={styles.modalTitle}>Edit Height</Text>
          <Text style={styles.modalSubtitle}>
            Examples: 5'8, 5'8", 5 8, 5ft 8in
          </Text>
          <TextInput
            style={styles.modalInput}
            value={tempValue}
            onChangeText={setTempValue}
            placeholder="5'9"
            placeholderTextColor="#666"
            keyboardType="default"
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
  modalSubtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 18,
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

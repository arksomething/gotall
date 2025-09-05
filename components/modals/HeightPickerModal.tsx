import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logger } from "../../utils/Logger";
import { useUserData } from "../../utils/UserContext";
import { convert } from "../../utils/heightUtils";
import i18n from "../../utils/i18n";
import {
  generateImperialHeight,
  generateMetricHeight,
} from "../../utils/pickerData";
import { TimePicker } from "../TimePicker";

interface HeightPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HeightPickerModal: React.FC<HeightPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { userData, updateUserData } = useUserData();
  const isImperial = userData.preferredHeightUnit === "ft";
  const items = React.useMemo(
    () => (isImperial ? generateImperialHeight() : generateMetricHeight()),
    [isImperial]
  );
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  React.useEffect(() => {
    // Preselect current value in the exact format used by picker items
    if (visible) {
      if (isImperial) {
        const totalInches = convert(userData.heightCm).from("cm").to("in");
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setSelectedValue(`${feet} ft ${inches} in`);
      } else {
        setSelectedValue(`${Math.round(userData.heightCm)} cm`);
      }
      logger.event("height_update_modal_shown");
    }
  }, [visible, isImperial, userData.heightCm]);

  const handleSave = async () => {
    try {
      let heightCm: number;
      if (isImperial) {
        const match = selectedValue.match(/(\d+) ft (\d+) in/);
        if (!match) return;
        const feet = parseInt(match[1]);
        const inches = parseInt(match[2]);
        heightCm = Math.round((feet * 12 + inches) * 2.54);
      } else {
        const match = selectedValue.match(/(\d+)/);
        if (!match) return;
        heightCm = parseInt(match[1]);
      }
      logger.event("height_update_saved", {
        value_display: selectedValue,
        value_cm: heightCm,
      });
      await updateUserData({ heightCm });
      onClose();
    } catch (e) {
      logger.event("height_update_save_error");
      onClose();
    }
  };

  const handleCancel = () => {
    logger.event("height_update_cancel");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {i18n.t("tabs:home_update_height")}
          </Text>
          <View style={styles.pickerContainer}>
            <TimePicker
              selectedValue={selectedValue}
              onValueChange={setSelectedValue}
              items={items}
              containerStyle={styles.picker}
            />
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
              <Text style={styles.modalButtonText}>
                {i18n.t("tabs:cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonPrimary,
                !selectedValue && styles.disabled,
              ]}
              onPress={handleSave}
              disabled={!selectedValue}
            >
              <Text style={styles.modalButtonTextPrimary}>
                {i18n.t("tabs:save")}
              </Text>
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
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 16,
  },
  picker: {
    width: "100%",
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
    backgroundColor: "#222",
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
  disabled: {
    opacity: 0.5,
  },
});

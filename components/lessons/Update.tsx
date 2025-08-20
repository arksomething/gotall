import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUserData } from "../../utils/UserContext";
import {
  generateImperialHeight,
  generateImperialWeight,
  generateMetricHeight,
  generateMetricWeight,
} from "../../utils/pickerData";
import { TimePicker } from "../TimePicker";

interface UpdateStep {
  type: "update";
  title: string;
  measurement: "height" | "weight";
}

interface Props {
  step: UpdateStep;
}

export default function Update({ step }: Props) {
  const { userData, updateUserData, getDisplayHeight, getDisplayWeight } =
    useUserData();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const getCurrentValue = () => {
    if (step.measurement === "height") {
      return getDisplayHeight();
    } else if (step.measurement === "weight") {
      return getDisplayWeight();
    }
    return "";
  };

  const getOptions = () => {
    if (step.measurement === "height") {
      return userData.preferredHeightUnit === "ft"
        ? generateImperialHeight()
        : generateMetricHeight();
    } else if (step.measurement === "weight") {
      return userData.preferredWeightUnit === "lbs"
        ? generateImperialWeight()
        : generateMetricWeight();
    }
    return [];
  };

  const options = useMemo(
    () => getOptions(),
    [
      step.measurement,
      userData.preferredHeightUnit,
      userData.preferredWeightUnit,
    ]
  );

  const handleUpdate = async () => {
    if (!selectedValue) {
      alert("Please select a value first.");
      return;
    }

    setIsUpdating(true);
    try {
      if (step.measurement === "height") {
        // Convert display value back to cm for storage
        let heightCm: number;
        if (userData.preferredHeightUnit === "ft") {
          // Parse "5 ft 7 in" format to cm
          const match = selectedValue.match(/(\d+) ft (\d+) in/);
          if (match) {
            const feet = parseInt(match[1]);
            const inches = parseInt(match[2]);
            heightCm = Math.round((feet * 12 + inches) * 2.54);
          } else {
            throw new Error("Invalid height format");
          }
        } else {
          // Parse "170 cm" format
          heightCm = parseInt(selectedValue);
        }

        await updateUserData({
          heightCm: heightCm,
        });
      } else if (step.measurement === "weight") {
        // Convert display value back to kg for storage
        let weightKg: number;
        if (userData.preferredWeightUnit === "lbs") {
          // Parse "150 lb" format to kg
          const lbs = parseInt(selectedValue);
          weightKg = Math.round(lbs * 0.453592);
        } else {
          // Parse "68 kg" format
          weightKg = parseInt(selectedValue);
        }

        await updateUserData({
          weight: weightKg,
        });
      }

      alert(
        `${
          step.measurement === "height" ? "Height" : "Weight"
        } updated successfully!`
      );
    } catch (error) {
      console.error("Error updating measurement:", error);
      alert("Failed to update measurement. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>
        <View style={styles.pickerContainer}>
          <TimePicker
            selectedValue={selectedValue}
            onValueChange={setSelectedValue}
            items={options}
            containerStyle={styles.picker}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            !selectedValue && styles.updateButtonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={!selectedValue || isUpdating}
        >
          <Ionicons name="checkmark-outline" size={24} color="#000" />
          <Text style={styles.updateButtonText}>
            {isUpdating ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  cardStyle: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 30,
  },
  picker: {
    width: "100%",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9ACD32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 120,
    justifyContent: "center",
  },
  updateButtonDisabled: {
    backgroundColor: "#666",
  },
  updateButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

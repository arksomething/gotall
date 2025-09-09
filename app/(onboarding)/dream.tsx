import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import i18n from "../../utils/i18n";
import { useUserData } from "../../utils/UserContext";
import { useOnboarding } from "./_layout";

// Convert 5'10" to cm for default height
const DEFAULT_HEIGHT = Math.round((5 * 12 + 10) * 2.54); // 178cm

function DreamScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { dreamHeightCm, setDreamHeightCm, units, toggleUnits, heightData } =
    useOnboarding();
  const { userData } = useUserData();

  const [selectedHeight, setSelectedHeight] = useState(
    dreamHeightCm || DEFAULT_HEIGHT
  );

  const isMetric = units === "metric";

  // Set default dream height if not already set
  useEffect(() => {
    if (!dreamHeightCm) {
      setDreamHeightCm(DEFAULT_HEIGHT);
    }
  }, [dreamHeightCm, setDreamHeightCm]);

  // Convert heightData to numeric cm values for the dream height picker
  const heightOptions = useMemo(() => {
    return heightData.map((item) => {
      if (isMetric) {
        const cm = parseInt(item.value, 10);
        return { label: item.label, value: cm };
      } else {
        const match = item.value.match(/(\d+)\s*ft\s*(\d+)\s*in/);
        if (!match) {
          return { label: item.label, value: 0 };
        }
        const feet = parseInt(match[1], 10);
        const inches = parseInt(match[2], 10);
        const totalInches = feet * 12 + inches;
        const cm = Math.round(totalInches * 2.54);
        return { label: item.label, value: cm };
      }
    });
  }, [heightData, isMetric]);

  const handleHeightChange = (value: number) => {
    setSelectedHeight(value);
    setDreamHeightCm(value);
  };

  const handleToggleUnits = () => {
    const newIsMetric = !isMetric; // predicted new state after toggle
    // Find closest height in the upcoming unit system
    const newOptions = heightData.map((item) => {
      if (newIsMetric) {
        // Metric: "170 cm" → 170
        const cm = parseInt(item.value, 10);
        return { label: item.label, value: cm };
      } else {
        // Imperial: "5 ft 7 in" → cm
        const match = item.value.match(/(\d+)\s*ft\s*(\d+)\s*in/);
        if (!match) {
          return { label: item.label, value: 0 };
        }
        const feet = parseInt(match[1], 10);
        const inches = parseInt(match[2], 10);
        const totalInches = feet * 12 + inches;
        const cm = Math.round(totalInches * 2.54);
        return { label: item.label, value: cm };
      }
    });
    const closestHeight = newOptions.reduce((prev, curr) => {
      return Math.abs(curr.value - selectedHeight) <
        Math.abs(prev.value - selectedHeight)
        ? curr
        : prev;
    });
    setSelectedHeight(closestHeight.value);
    setDreamHeightCm(closestHeight.value);
    // Propagate the unit change through shared context
    toggleUnits();
  };

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:dream_title")}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {i18n.t("onboarding:dream_picker_title")}
          </Text>
          <View style={styles.pickerColumn}>
            <Text style={styles.label}>
              {isMetric
                ? i18n.t("onboarding:dream_label_metric")
                : i18n.t("onboarding:dream_label_imperial")}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedHeight}
                onValueChange={handleHeightChange}
                style={[
                  styles.picker,
                  Platform.OS === "ios" && styles.pickerIOS,
                ]}
              >
                {heightOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.unitsContainer}>
            <Text style={[styles.unitText, !isMetric && styles.activeUnit]}>
              {i18n.t("onboarding:dream_units_imperial")}
            </Text>
            <Switch
              value={isMetric}
              onValueChange={handleToggleUnits}
              trackColor={{ false: "#333", true: "#9ACD32" }}
              thumbColor={"#fff"}
              ios_backgroundColor="#333"
              style={styles.switch}
            />
            <Text style={[styles.unitText, isMetric && styles.activeUnit]}>
              {i18n.t("onboarding:dream_units_metric")}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    width: "100%",
  },
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
  pickerColumn: {
    marginBottom: 32,
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

export default withOnboarding(DreamScreen, "dream");

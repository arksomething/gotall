import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

// Convert 5'10" to cm for default height
const DEFAULT_HEIGHT = Math.round((5 * 12 + 10) * 2.54); // 178cm

// Generate height options for both metric and imperial
const generateHeightOptions = (isMetric: boolean) => {
  if (isMetric) {
    // Metric: 122cm to 213cm (4'0" to 7'0")
    return Array.from({ length: 92 }, (_, i) => {
      const cm = i + 122;
      return {
        label: `${cm} cm`,
        value: cm,
      };
    });
  } else {
    // Imperial: 4'0" to 7'0" with inch increments
    const options = [];
    for (let feet = 4; feet <= 7; feet++) {
      for (let inches = 0; inches <= 11; inches++) {
        // Convert to cm for internal value
        const totalInches = feet * 12 + inches;
        const cm = Math.round(totalInches * 2.54);
        options.push({
          label: `${feet}'${inches}"`,
          value: cm,
        });
      }
    }
    return options;
  }
};

function DreamScreen({ onNext, onBack }: OnboardingScreenProps) {
  const { dreamHeightCm, setDreamHeightCm } = useOnboarding();
  const [selectedHeight, setSelectedHeight] = useState(
    dreamHeightCm || DEFAULT_HEIGHT
  );
  const [isMetric, setIsMetric] = useState(false);

  // Set default dream height if not already set
  useEffect(() => {
    if (!dreamHeightCm) {
      setDreamHeightCm(DEFAULT_HEIGHT);
    }
  }, [dreamHeightCm, setDreamHeightCm]);

  const heightOptions = generateHeightOptions(isMetric);

  const handleHeightChange = (value: number) => {
    setSelectedHeight(value);
    setDreamHeightCm(value);
  };

  const toggleUnit = () => {
    setIsMetric(!isMetric);
    // Find closest height in new unit system
    const newOptions = generateHeightOptions(!isMetric);
    const closestHeight = newOptions.reduce((prev, curr) => {
      return Math.abs(curr.value - selectedHeight) <
        Math.abs(prev.value - selectedHeight)
        ? curr
        : prev;
    });
    setSelectedHeight(closestHeight.value);
    setDreamHeightCm(closestHeight.value);
  };

  return (
    <OnboardingLayout
      title="What's your dream height?"
      currentStep={7}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Select your dream height</Text>
          <View style={styles.pickerColumn}>
            <Text style={styles.label}>
              {isMetric ? "Centimeters" : "Feet & Inches"}
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
              Imperial
            </Text>
            <Switch
              value={isMetric}
              onValueChange={toggleUnit}
              trackColor={{ false: "#333", true: "#9ACD32" }}
              thumbColor={"#fff"}
              ios_backgroundColor="#333"
              style={styles.switch}
            />
            <Text style={[styles.unitText, isMetric && styles.activeUnit]}>
              Metric
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

export default withOnboarding(DreamScreen, 7, "dream", "product");

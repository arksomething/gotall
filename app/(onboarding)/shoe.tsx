import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { useOnboarding } from "./_layout";

// Generate simple US & EU shoe size ranges
const generateUsSizes = () =>
  Array.from({ length: 13 }, (_, i) => {
    const size = (4 + i).toString(); // US sizes 4 – 16
    return { label: size, value: size };
  });

const generateEuSizes = () =>
  Array.from({ length: 16 }, (_, i) => {
    const size = (35 + i).toString(); // EU sizes 35 – 50
    return { label: size, value: size };
  });

const usSizes = generateUsSizes();
const euSizes = generateEuSizes();

function ShoeScreen({ onNext, onBack }: OnboardingScreenProps) {
  const {
    usShoeSize,
    setUsShoeSize,
    euShoeSize,
    setEuShoeSize,
    units,
    toggleUnits,
  } = useOnboarding();

  const isMetric = units === "metric";
  const currentSize = isMetric ? euShoeSize : usShoeSize;
  const setSize = isMetric ? setEuShoeSize : setUsShoeSize;
  const sizes = isMetric ? euSizes : usSizes;

  return (
    <OnboardingLayout
      title="What is your shoe size?"
      currentStep={6}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.stepContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Select your shoe size</Text>
          <View style={styles.pickerColumn}>
            <Text style={styles.label}>{isMetric ? "EU Size" : "US Size"}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={currentSize}
                onValueChange={setSize}
                style={[
                  styles.picker,
                  Platform.OS === "ios" && styles.pickerIOS,
                ]}
              >
                {sizes.map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.unitsContainer}>
            <Text style={[styles.unitText, !isMetric && styles.activeUnit]}>
              US
            </Text>
            <Switch
              value={isMetric}
              onValueChange={toggleUnits}
              trackColor={{ false: "#333", true: "#9ACD32" }}
              thumbColor={"#fff"}
              ios_backgroundColor="#333"
              style={styles.switch}
            />
            <Text style={[styles.unitText, isMetric && styles.activeUnit]}>
              EU
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

// NOTE: Using "shoe" as a placeholder route key since "shoe" is not yet
// included in the ROUTES union. Adjust when integrating into navigation.
export default withOnboarding(ShoeScreen, 6, "shoe", "dream");

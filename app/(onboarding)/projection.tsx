import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { HeightGraph } from "../../components/HeightGraph";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import { useUserData } from "../../utils/UserContext";
import { getProjectedHeights } from "../../utils/heightProjection";
import { convert } from "../../utils/heightUtils";

interface HeightData {
  currentHeight: string;
  potentialHeight: string;
  actualHeight: string;
  lowerBoundHeight?: string;
  upperBoundHeight?: string;
}

const ProjectionScreen = () => {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const [heightData, setHeightData] = useState<HeightData>({
    currentHeight: "4'10\"",
    potentialHeight: "5'11\"",
    actualHeight: "5'7\"",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData) return;

    try {
      setError(null);
      console.log("Calculating projections with user data:", {
        heightCm: userData.heightCm,
        age: getAge(),
        sex: userData.sex,
        motherHeightCm: userData.motherHeightCm,
        fatherHeightCm: userData.fatherHeightCm,
      });

      // Convert current height to feet/inches
      const currentHeightInches = convert(userData.heightCm)
        .from("cm")
        .to("in");
      const currentFeet = Math.floor(currentHeightInches / 12);
      const currentInches = Math.round(currentHeightInches % 12);
      const currentHeight =
        currentInches === 12
          ? `${currentFeet + 1}'0"`
          : `${currentFeet}'${currentInches}"`;
      console.log("Current height calculated:", currentHeight);

      // Calculate genetic potential (midparental height) first
      let actualHeight = "";
      if (userData.motherHeightCm && userData.fatherHeightCm) {
        // Midparental height formula
        const targetHeightCm =
          userData.sex === "1"
            ? (userData.fatherHeightCm + userData.motherHeightCm + 13) / 2 // For boys: (father + mother + 13) / 2
            : (userData.fatherHeightCm + userData.motherHeightCm - 13) / 2; // For girls: (father + mother - 13) / 2

        const targetHeightInches = convert(targetHeightCm).from("cm").to("in");
        const targetFeet = Math.floor(targetHeightInches / 12);
        const targetInches = Math.round(targetHeightInches % 12);
        actualHeight =
          targetInches === 12
            ? `${targetFeet + 1}'0"`
            : `${targetFeet}'${targetInches}"`;
        console.log(
          "Genetic potential (actual height) calculated:",
          actualHeight
        );
      }

      // Try to get CDC projections
      try {
        const cdcProjections = getProjectedHeights(
          userData.heightCm,
          getAge(),
          userData.sex
        );
        console.log("CDC projections calculated:", cdcProjections);

        // If CDC projection is available, use it as actual height
        if (cdcProjections.exact) {
          actualHeight = cdcProjections.exact;
        }
      } catch (cdcError) {
        console.log(
          "CDC projection failed, using genetic potential:",
          cdcError
        );
        // If CDC fails, we'll keep using the genetic potential as actual height
      }

      // If we still don't have an actual height, use current height
      if (!actualHeight) {
        actualHeight = currentHeight;
      }

      // Calculate potential height (actual + 2 inches)
      const actualHeightParts = actualHeight.split("'");
      const actualFeet = parseInt(actualHeightParts[0]);
      const actualInches = parseInt(actualHeightParts[1]);
      let potentialInches = actualInches + 2;
      let potentialFeet = actualFeet;

      if (potentialInches >= 12) {
        potentialFeet += Math.floor(potentialInches / 12);
        potentialInches = potentialInches % 12;
      }

      const potentialHeight = `${potentialFeet}'${potentialInches}"`;
      console.log("Final heights calculated:", {
        currentHeight,
        actualHeight,
        potentialHeight,
      });

      setHeightData({
        currentHeight,
        actualHeight,
        potentialHeight,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error calculating height projections:", {
        error: errorMessage,
        userData: {
          heightCm: userData.heightCm,
          age: getAge(),
          sex: userData.sex,
        },
      });
      setError(errorMessage);
      Alert.alert(
        "Height Projection Error",
        "There was an error calculating your height projection. This might be because:\n\n" +
          "• Your age is outside our data range\n" +
          "• There was an issue with the growth data\n\n" +
          "Technical details: " +
          errorMessage
      );
    }
  }, [userData]);

  const compareHeights = (height1: string, height2: string): string => {
    const [feet1, inches1] = height1.split("'").map((v) => parseFloat(v));
    const [feet2, inches2] = height2.split("'").map((v) => parseFloat(v));

    const totalInches1 = feet1 * 12 + inches1;
    const totalInches2 = feet2 * 12 + inches2;

    return totalInches1 >= totalInches2 ? height1 : height2;
  };

  return (
    <OnboardingLayout
      title="Your Height Projection"
      currentStep={7}
      onNext={() => router.push("/(onboarding)/subscription" as any)}
      onBack={() => router.back()}
      nextButtonText="Continue"
    >
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Sorry, we couldn't calculate your height projection.
            </Text>
            <Text style={styles.errorDetail}>{error}</Text>
          </View>
        ) : (
          <>
            <HeightGraph {...heightData} />
            {heightData.lowerBoundHeight && heightData.upperBoundHeight && (
              <View style={styles.rangeContainer}>
                <Text style={styles.rangeText}>
                  Your height could be between{" "}
                  <Text style={styles.rangeValue}>
                    {heightData.lowerBoundHeight}
                  </Text>
                  {" and "}
                  <Text style={styles.rangeValue}>
                    {heightData.upperBoundHeight}
                  </Text>
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  errorDetail: {
    color: "#868e96",
    fontSize: 14,
    textAlign: "center",
  },
  rangeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(154, 205, 50, 0.1)",
    borderRadius: 12,
  },
  rangeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  rangeValue: {
    color: "#9ACD32",
    fontWeight: "bold",
  },
});

export default withOnboarding(ProjectionScreen, 7, "projection");

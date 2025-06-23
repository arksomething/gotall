import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { HeightGraph } from "../../components/HeightGraph";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import { useUserData } from "../../utils/UserContext";
import { calculateHeightProjection } from "../../utils/heightProjection";

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

  const calculateProjections = useCallback(() => {
    try {
      setError(null);
      console.log("Calculating projections with user data:", {
        heightCm: userData.heightCm,
        age: getAge(),
        sex: userData.sex,
        motherHeightCm: userData.motherHeightCm,
        fatherHeightCm: userData.fatherHeightCm,
      });

      const projectionData = calculateHeightProjection({
        heightCm: userData.heightCm,
        age: getAge(),
        sex: userData.sex,
        motherHeightCm: userData.motherHeightCm,
        fatherHeightCm: userData.fatherHeightCm,
      });

      console.log("Final heights calculated:", projectionData);
      setHeightData(projectionData);
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
  }, [userData, getAge]);

  useEffect(() => {
    calculateProjections();
  }, [calculateProjections]);

  return (
    <OnboardingLayout
      title="Your Height Projection"
      currentStep={6}
      onNext={() => router.push("/(onboarding)/subscription" as any)}
      onBack={() => router.push("/(onboarding)/parents" as any)}
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

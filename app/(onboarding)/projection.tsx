import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { getAvailablePurchases } from "react-native-iap";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import { useOnboarding } from "../../utils/OnboardingContext";
import { useUserData } from "../../utils/UserContext";
import { calculateDreamHeightProbability } from "../../utils/dreamHeightProbability";
import { calculateHeightProjection } from "../../utils/heightProjection";
import {
  convert,
  HeightFormatter,
  parseHeightToCm,
} from "../../utils/heightUtils";

interface HeightData {
  currentHeight: string;
  potentialHeight: string;
  actualHeight: string;
  percentileRank?: number;
  growthComplete?: number;
  heightGainPotential?: number;
  lowerBoundHeight?: string;
  upperBoundHeight?: string;
}

const ProjectionScreen = () => {
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const { setIsOnboardingComplete } = useOnboarding();
  const [hasPaid, setHasPaid] = useState(false);
  const [heightData, setHeightData] = useState<HeightData>({
    currentHeight: "5'7\"",
    potentialHeight: "5'11\"",
    actualHeight: "5'7\"",
  });
  const [dreamData, setDreamData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const windowWidth = Dimensions.get("window").width;

  // Helper to convert any height string (ft/in or cm) to centimetres
  const parseAnyHeightToCm = (h: string): number => {
    if (h.toLowerCase().includes("cm")) {
      return parseHeightToCm(h.replace(/cm/i, "").trim(), "cm");
    }
    return parseHeightToCm(h, "ft");
  };

  const isMetric = userData.preferredHeightUnit === "cm";

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

      // Convert heights for display based on preferred unit
      const convertedData: HeightData = {
        ...projectionData,
        currentHeight: HeightFormatter.formatHeightForDisplay(
          projectionData.currentHeight,
          userData.preferredHeightUnit
        ),
        actualHeight: HeightFormatter.formatHeightForDisplay(
          projectionData.actualHeight,
          userData.preferredHeightUnit
        ),
        potentialHeight: HeightFormatter.formatHeightForDisplay(
          projectionData.potentialHeight,
          userData.preferredHeightUnit
        ),
      };

      setHeightData(convertedData);

      // Calculate dream height probability if dream height set
      if (userData.dreamHeightCm && userData.dreamHeightCm > 0) {
        const dream = calculateDreamHeightProbability({
          dreamHeightCm: userData.dreamHeightCm,
          currentHeightCm: userData.heightCm,
          age: getAge(),
          sex: userData.sex,
          motherHeightCm: userData.motherHeightCm,
          fatherHeightCm: userData.fatherHeightCm,
        });
        setDreamData(dream);
      } else {
        setDreamData(null);
      }
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

  useEffect(() => {
    const checkPurchases = async () => {
      try {
        const purchases = await getAvailablePurchases();
        setHasPaid(purchases.length > 0);
      } catch (e) {
        console.warn("Error checking purchases:", e);
        setHasPaid(false);
      }
    };
    checkPurchases();
  }, []);

  const handleNext = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const purchases = await getAvailablePurchases();
      if (purchases.length === 0) {
        router.push("/(onboarding)/subscription" as any);
      } else {
        await setIsOnboardingComplete(true);
        router.replace("/(tabs)");
      }
    } catch (e) {
      console.warn("Error checking purchases before subscription");
      router.push("/(onboarding)/subscription" as any);
    }
  };

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/short" as any);
  };

  // Calculate height gain in the user's preferred units
  const heightGain = hasPaid
    ? (() => {
        const diffCm = Math.max(
          0,
          parseAnyHeightToCm(heightData.potentialHeight) -
            parseAnyHeightToCm(heightData.actualHeight)
        );
        return isMetric
          ? Math.round(diffCm)
          : Math.round(convert(diffCm).from("cm").to("in"));
      })()
    : 0;

  const unitLabel = isMetric ? "cm" : "inch(es)";

  return (
    <OnboardingLayout
      title="Your Height Projection"
      currentStep={13}
      onNext={handleNext}
      onBack={handleBack}
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
            <View style={styles.metricsContainer}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>On track to be:</Text>
                <View style={[styles.heightBox, styles.heightBoxLarge]}>
                  <Text style={[styles.metricValue, styles.heightValue]}>
                    {heightData.actualHeight}
                  </Text>
                </View>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>True potential:</Text>
                <View style={[styles.lockedMetric, styles.heightBoxLarge]}>
                  {!hasPaid && (
                    <BlurView
                      intensity={10}
                      tint="dark"
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  <Text style={[styles.metricValue, styles.potentialValue]}>
                    {hasPaid ? heightData.potentialHeight : "🔒"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.optimizeContainer}>
              <Text style={styles.optimizeText}>
                {hasPaid ? (
                  <>
                    Optimize up to{" "}
                    <Text style={styles.highlight}>{heightGain}</Text>{" "}
                    {unitLabel}
                  </>
                ) : (
                  `Optimize up to 🔒 ${unitLabel}`
                )}
              </Text>
            </View>

            <Image
              source={require("../../assets/images/Frame 8.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <View style={styles.metricsContainer}>
              <View style={[styles.metricBox, styles.smallMetricBox]}>
                <Text style={styles.metricLabel}>
                  {hasPaid ? (
                    <>
                      Growth:{" "}
                      <Text style={styles.highlight}>
                        {heightData.growthComplete || 85}%
                      </Text>
                    </>
                  ) : (
                    "Growth complete: 🔒%"
                  )}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: hasPaid
                            ? `${heightData.growthComplete || 85}%`
                            : "60%",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressContent} />
                </View>
              </View>

              {dreamData && (
                <View style={[styles.metricBox, styles.smallMetricBox]}>
                  <Text style={styles.metricLabel}>Dream Odds</Text>
                  <View style={styles.heightBox}>
                    {!hasPaid && (
                      <BlurView
                        intensity={10}
                        tint="dark"
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                    <Text style={[styles.metricValue, styles.heightValue]}>
                      {hasPaid
                        ? `${Math.round(dreamData.probability / 5) * 5}%`
                        : "🔒"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.optimizeContainer}>
              <Text style={styles.optimizeText}>
                {hasPaid ? (
                  <>
                    Taller than{" "}
                    <Text style={styles.highlight}>
                      {heightData.percentileRank || 50}%
                    </Text>{" "}
                    of your age
                  </>
                ) : (
                  "Taller than 🔒 of your age"
                )}
              </Text>
            </View>
          </>
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginHorizontal: -4,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  metricLabel: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 8,
  },
  metricValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  lockedMetric: {
    backgroundColor: "#9ACD32",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 4,
    minHeight: 48,
  },
  optimizeContainer: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  optimizeText: {
    color: "#FFF",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 0,
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
  heightBox: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 4,
    minHeight: 48,
  },
  highlight: {
    color: "#9ACD32",
    fontWeight: "bold",
  },
  heightValue: {
    color: "#9ACD32",
    fontSize: 24,
    fontWeight: "bold",
  },
  potentialValue: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#222",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
    marginTop: 24,
  },
  progressBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
  },
  progressBar: {
    backgroundColor: "#9ACD32",
    height: "100%",
    width: "60%",
    borderRadius: 2,
  },
  progressContent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  dreamChanceText: {
    marginTop: 8,
  },
  smallMetricBox: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  heightBoxLarge: {
    padding: 16,
    minHeight: 64,
  },
});

export default withOnboarding(ProjectionScreen, 7, "projection");

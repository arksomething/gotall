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
  const { setIsOnboardingComplete } = useOnboarding();
  const [heightData, setHeightData] = useState<HeightData>({
    currentHeight: "4'10\"",
    potentialHeight: "5'11\"",
    actualHeight: "5'7\"",
  });
  const [error, setError] = useState<string | null>(null);
  const windowWidth = Dimensions.get("window").width;

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
    router.push("/(onboarding)/parents" as any);
  };

  return (
    <OnboardingLayout
      title="Your Height Projection"
      currentStep={6}
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
            <View style={styles.graphContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                  <Text>GoTall is powered by the </Text>
                  <Text style={styles.highlight}>CDC</Text>
                  <Text> dataset, creating </Text>
                  <Text style={styles.highlight}>useful</Text>
                  <Text> and </Text>
                  <Text style={styles.highlight}>accurate</Text>
                  <Text> predictions.</Text>
                </Text>
                <View style={styles.heightRow}>
                  <Text style={[styles.heightLabel, styles.potentialLabel]}>
                    Your true potential is:
                  </Text>
                  <View style={styles.heightBoxContainer}>
                    <View style={styles.heightBox}>
                      <Text style={styles.heightText}>
                        {heightData.potentialHeight}
                      </Text>
                      <BlurView
                        intensity={10}
                        tint="default"
                        style={[StyleSheet.absoluteFillObject, styles.blurView]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.trackRow}>
                  <Text style={styles.heightLabel}>
                    But you're on track to be
                  </Text>
                  <Text style={[styles.heightText, styles.trackHeight]}>
                    {heightData.actualHeight}
                  </Text>
                </View>
              </View>
              <Image
                source={require("../../assets/images/Frame 8.png")}
                style={[styles.image, { width: windowWidth - 32 }]}
                resizeMode="contain"
              />

              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.currentDot]} />
                  <Text style={[styles.legendText, styles.currentText]}>
                    Current Height: {heightData.currentHeight}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.actualDot]} />
                  <Text style={[styles.legendText, styles.actualText]}>
                    Projected Height: {heightData.actualHeight}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.potentialDot]} />
                  <Text style={[styles.legendText, styles.potentialLegendText]}>
                    True Potential: {heightData.potentialHeight}
                  </Text>
                </View>
              </View>
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
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  graphContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#000",
    paddingBottom: 16,
  },
  headerContainer: {
    width: "100%",
    padding: 16,
  },
  headerText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    marginBottom: 24,
  },
  highlight: {
    color: "#9ACD32",
  },
  heightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heightLabel: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "500",
  },
  potentialLabel: {
    color: "#FFF",
  },
  heightBoxContainer: {
    position: "relative",
  },
  heightBox: {
    backgroundColor: "#9ACD32",
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    alignItems: "center",
    marginLeft: 12,
    overflow: "hidden",
    position: "relative",
  },
  heightText: {
    color: "#000",
    fontSize: 28,
    fontWeight: "bold",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  trackHeight: {
    color: "#9ACD32",
    marginLeft: 12,
  },
  image: {
    height: 300,
  },
  legend: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    fontWeight: "500",
  },
  currentDot: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#666",
  },
  currentText: {
    color: "#FFFFFF",
  },
  actualDot: {
    backgroundColor: "#9ACD32",
  },
  actualText: {
    color: "#9ACD32",
  },
  potentialDot: {
    backgroundColor: "#96437B",
  },
  potentialLegendText: {
    color: "#96437B",
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
  blurView: {
    borderRadius: 12,
  },
});

export default withOnboarding(ProjectionScreen, 7, "projection");

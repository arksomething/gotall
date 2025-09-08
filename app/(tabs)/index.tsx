import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/Card";
import Graph from "../../components/Graph";
import { Header } from "../../components/Header";
import { HeightPickerModal } from "../../components/modals/HeightPickerModal";
import { WeightModal } from "../../components/modals/WeightModal";
import { CONFIG } from "../../utils/config";
import { databaseManager } from "../../utils/database";
import { calculateDreamHeightProbability } from "../../utils/dreamHeightProbability";
import { calculateHealthGoals } from "../../utils/healthGoals";
import { calculateHeightProjection } from "../../utils/heightProjection";
import { convert, HeightFormatter } from "../../utils/heightUtils";
import i18n from "../../utils/i18n";
import { logger } from "../../utils/Logger";
import { useUserData } from "../../utils/UserContext";
import { useUnits } from "../../utils/useUnits";

export default function Index() {
  const {
    userData,
    updateUserData,
    getAge,
    getDisplayHeight,
    getDisplayWeight,
  } = useUserData();

  const { height: formatHeight, preferredHeightUnit } = useUnits();
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [tempWeightValue, setTempWeightValue] = useState("");
  const [tempHeightValue, setTempHeightValue] = useState("");
  const [heightData, setHeightData] = useState({
    currentHeight: "",
    actualHeight: "",
    potentialHeight: "",
  });
  const [percentileInfo, setPercentileInfo] = useState<string | null>(null);
  const [healthGoals, setHealthGoals] = useState<{
    sleepHours: number;
    calories: number;
  }>({ sleepHours: 0, calories: 0 });
  const [dreamHeightData, setDreamHeightData] = useState<{
    probability: number;
    probabilityText: string;
    dreamHeightFormatted: string;
    heightDifference: number;
    heightDifferenceFormatted: string;
  } | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [canUpdateHeight, setCanUpdateHeight] = useState(true);
  const [countdown, setCountdown] = useState<string>("");
  // Track dwell time for Home tab
  useFocusEffect(
    React.useCallback(() => {
      const key = "screen_home";
      logger.startTimer(key);
      return () => {
        logger.endTimer(key);
      };
    }, [])
  );

  // Get live data from UserContext
  const userAge = getAge();
  const userAgeInMonths = userAge * 12;

  useEffect(() => {
    if (userData?.heightCm) {
      try {
        const projectionData = calculateHeightProjection({
          heightCm: userData.heightCm,
          age: getAge(),
          sex: userData.sex,
          motherHeightCm: userData.motherHeightCm,
          fatherHeightCm: userData.fatherHeightCm,
        });

        // Helper to convert projection height (ft/in string) to preferred unit
        const toDisplay = (ftHeight: string) => {
          return HeightFormatter.formatHeightForDisplay(
            ftHeight,
            userData.preferredHeightUnit
          );
        };

        setHeightData({
          currentHeight: HeightFormatter.formatHeightForDisplayPreserveOriginal(
            userData.heightCm,
            projectionData.currentHeight,
            userData.preferredHeightUnit
          ),
          actualHeight: toDisplay(projectionData.actualHeight),
          potentialHeight: toDisplay(projectionData.potentialHeight),
        });
      } catch (error) {
        console.error("Error calculating height projections:", error);
      }
    }
  }, [userData, getAge]);

  // Gate height updates for 7 days after the last change, show countdown
  useEffect(() => {
    let timer: any;
    const updateCountdown = async () => {
      try {
        const storage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        const lastMsStr = await storage.getItem("@last_height_update_ms");
        const lastMs = lastMsStr ? parseInt(lastMsStr) : 0;
        const now = Date.now();
        const windowMs = CONFIG.HEIGHT_UPDATE_COOLDOWN_MS;
        const remaining = lastMs ? Math.max(0, lastMs + windowMs - now) : 0;
        const enabled = remaining === 0;
        setCanUpdateHeight(enabled);
        if (!enabled) {
          const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
          const hours = Math.floor(
            (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
          );
          const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          const secs = Math.floor((remaining % (60 * 1000)) / 1000);
          setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown("");
        }
      } catch {
        setCanUpdateHeight(true);
        setCountdown("");
      }
    };
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
    return () => timer && clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userData) {
      const goals = calculateHealthGoals(getAge(), userData.sex);
      setHealthGoals(goals);

      // Calculate dream height probability if dream height is set
      if (userData.dreamHeightCm && userData.dreamHeightCm > 0) {
        try {
          const rawDreamData = calculateDreamHeightProbability({
            dreamHeightCm: userData.dreamHeightCm,
            currentHeightCm: userData.heightCm,
            age: getAge(),
            sex: userData.sex,
            motherHeightCm: userData.motherHeightCm,
            fatherHeightCm: userData.fatherHeightCm,
          });

          // Format values for preferred unit
          const dreamHeightFormatted = formatHeight(userData.dreamHeightCm);

          const diffCm = rawDreamData.heightDifference;
          const heightDifferenceFormatted =
            preferredHeightUnit === "cm"
              ? `${diffCm}cm`
              : (() => {
                  const totalInches = convert(diffCm).from("cm").to("in");
                  const feet = Math.floor(totalInches / 12);
                  const inches = Math.round(totalInches % 12);
                  if (feet === 0) return `${inches}"`;
                  if (inches === 0) return `${feet}'`;
                  return `${feet}'${inches}"`;
                })();

          setDreamHeightData({
            ...rawDreamData,
            dreamHeightFormatted,
            heightDifferenceFormatted,
          });
        } catch (error) {
          console.error("Error calculating dream height probability:", error);
        }
      } else {
        setDreamHeightData(null);
      }
    }
  }, [userData, getAge]);

  // Refresh button gating when height is updated or modal closes
  useEffect(() => {
    const recompute = async () => {
      try {
        const storage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        const lastMsStr = await storage.getItem("@last_height_update_ms");
        const lastMs = lastMsStr ? parseInt(lastMsStr) : 0;
        const now = Date.now();
        const windowMs = CONFIG.HEIGHT_UPDATE_COOLDOWN_MS;
        const remaining = lastMs ? Math.max(0, lastMs + windowMs - now) : 0;
        const enabled = remaining === 0;
        setCanUpdateHeight(enabled);
        if (!enabled) {
          const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
          const hours = Math.floor(
            (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
          );
          const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          const secs = Math.floor((remaining % (60 * 1000)) / 1000);
          setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown("");
        }
      } catch {}
    };
    recompute();
  }, [userData.heightCm, heightModalVisible]);

  const openWeightModal = () => {
    setTempWeightValue(userData.weight.toString());
    setWeightModalVisible(true);
  };

  const openHeightModalFromButton = () => {
    // Set temp value using centralized utility
    setTempHeightValue(formatHeight(userData.heightCm));
    logger.event("height_update_open", { source: "button" });
    setHeightModalVisible(true);
  };

  // Debug function to completely purge and rebuild all goals
  const debugGoals = async () => {
    try {
      console.log("=== PURGING ALL GOALS ===");

      // Completely purge everything - all goals, completions, daily goals
      console.log("Purging all goals from database...");
      await databaseManager.purgeAllGoals();

      // Insert fresh static goals
      console.log("Inserting fresh static goals...");
      await databaseManager.insertDefaultGoals();

      // Generate today's daily goals (exactly 2: 1 stretch + 1 task)
      const today = new Date().toISOString().split("T")[0];
      console.log("Generating fresh daily goals...");
      await databaseManager.generateDailyGoals(today);

      await databaseManager.debugGoalsInDatabase();

      console.log("=== COMPLETE RESET FINISHED ===");
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  return (
    <View style={[styles.container]}>
      <Header
        title={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: "bold",
                marginRight: 6,
                marginVertical: 4,
              }}
            >
              {i18n.t("tabs:home_app_name")}
            </Text>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 26, height: 26, borderRadius: 4 }}
            />
          </View>
        }
        rightElement={
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.cardsRowInSection}>
            <Card
              label={i18n.t("tabs:home_current_height")}
              value={heightData.currentHeight}
            />
            <Card
              label={i18n.t("tabs:home_maximum_height")}
              value={heightData.potentialHeight}
              variant="projected"
            />
          </View>
        </View>

        {/* Progress Section with Graph */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>
              {i18n.t("tabs:home_projected_height")}
            </Text>
            <Ionicons
              name="trending-up"
              size={16}
              color="#9ACD32"
              style={styles.progressIcon}
            />
          </View>

          {/* Height Percentile Graph */}
          <Graph
            sex={userData.sex}
            age={userAgeInMonths}
            currentHeight={userData.heightCm}
            onPercentileCalculated={(info) => {
              if (info?.lowerBound) {
                const percentile = parseInt(info.lowerBound.name.substring(1));
                setPercentileInfo(`${percentile}`);
              }
            }}
          />

          {/* Update Height CTA */}
          <TouchableOpacity
            style={[
              styles.updateHeightButton,
              !canUpdateHeight && styles.updateHeightButtonDisabled,
            ]}
            onPress={canUpdateHeight ? openHeightModalFromButton : undefined}
            activeOpacity={0.8}
            disabled={!canUpdateHeight}
          >
            <Text
              style={[
                styles.updateHeightText,
                !canUpdateHeight && styles.updateHeightTextDisabled,
              ]}
            >
              {canUpdateHeight
                ? i18n.t("tabs:home_update_height")
                : `${i18n.t("tabs:home_next_update_in", { time: countdown })}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dream Height Section */}
        {dreamHeightData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("tabs:home_dream_height")}
            </Text>
            <View style={styles.cardsRowInSection}>
              <Card
                label={i18n.t("tabs:home_probability")}
                value={i18n.t(`tabs:${dreamHeightData.probabilityText}`)}
                subtext={`${dreamHeightData.probability}%`}
              />
              <Card
                label={i18n.t("tabs:home_dream_height")}
                value={dreamHeightData.dreamHeightFormatted}
                subtext={i18n.t("tabs:home_to_go_fmt", {
                  value: dreamHeightData.heightDifferenceFormatted,
                })}
              />
            </View>
          </View>
        )}

        {/* Health Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.t("tabs:home_health_goals")}
          </Text>
          <View style={styles.cardsRowInSection}>
            <Card
              label={i18n.t("tabs:home_sleep_goal")}
              value={`${healthGoals.sleepHours} ${i18n.t(
                "tabs:home_hours_abbr"
              )}`}
            />
            <Card
              label={i18n.t("tabs:home_daily_calories")}
              value={healthGoals.calories.toString()}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <WeightModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
        initialValue={tempWeightValue}
      />

      <HeightPickerModal
        visible={heightModalVisible}
        onClose={() => setHeightModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },

  cardsRowInSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 0, // No padding since section already has it
    marginBottom: 8,
    alignItems: "stretch",
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressIcon: {
    marginLeft: 8,
  },
  updateHeightButton: {
    marginTop: 12,
    alignSelf: "stretch",
    backgroundColor: "#9ACD32",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  updateHeightButtonDisabled: {
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#333",
  },
  updateHeightText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  updateHeightTextDisabled: {
    color: "#999",
  },
  progressSubtext: {
    color: "#666",
    fontSize: 14,
  },
  growthStatsContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  growthStat: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  growthProgressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(154, 205, 50, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  growthProgressFill: {
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 4,
  },
  growthText: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  percentileText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  percentileHighlight: {
    color: "#9ACD32",
    fontWeight: "600",
  },
  cardProgress: {
    width: "100%",
    marginTop: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 2,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    opacity: 0.7,
  },
});

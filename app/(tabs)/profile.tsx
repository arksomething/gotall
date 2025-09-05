import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/Header";
import { databaseManager } from "../../utils/database";
import i18n from "../../utils/i18n";
import { logger } from "../../utils/Logger";
import { useOnboarding } from "../../utils/OnboardingContext";
import { useUserData } from "../../utils/UserContext";

export default function ProfileScreen() {
  const {
    userData,
    loadUserData,
    getAge,
    getDisplayHeight,
    getDisplayWeight,
    getDisplayMotherHeight,
    getDisplayFatherHeight,
  } = useUserData();
  const { setIsOnboardingComplete } = useOnboarding();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Dwell time
  useFocusEffect(
    React.useCallback(() => {
      const key = "screen_profile";
      logger.startTimer(key);
      return () => {
        logger.endTimer(key);
      };
    }, [])
  );

  useEffect(() => {
    // Reload user data when profile screen is loaded
    loadUserData();
  }, []);

  const resetOnboarding = async () => {
    // Log entry click to measure how many users open the reset flow
    try {
      logger.event("profile_reset_click");
    } catch {}
    Alert.alert(
      i18n.t("tabs:profile_delete_account"),
      i18n.t("tabs:profile_delete_account_confirm"),
      [
        {
          text: i18n.t("tabs:common_cancel"),
          style: "cancel",
          onPress: () => {
            try {
              logger.event("profile_reset_cancel");
            } catch {}
          },
        },
        {
          text: i18n.t("tabs:common_reset"),
          style: "destructive",
          onPress: async () => {
            try {
              logger.event("profile_reset_confirm");
            } catch {}
            try {
              await AsyncStorage.multiRemove([
                "@user_height_cm",
                "@user_date_of_birth",
                "@user_sex",
                "@user_weight",
                "@user_mother_height_cm",
                "@user_father_height_cm",
                "@user_ethnicity",
                "@user_preferred_weight_unit",
                "@user_preferred_height_unit",
                "@user_dream_height_cm",
                // Puberty fields
                "@user_puberty_underarm_hair",
                "@user_puberty_facial_hair",
                "@user_puberty_growth_last_year",
                "@user_puberty_shoulders_broadening",
                "@user_puberty_body_odor",
                "@user_puberty_acne_severity",
                "@user_puberty_muscle_definition",
                "@user_puberty_voice_depth",
                "@user_puberty_still_growing_slower",
                "@user_puberty_shave_frequency",
                "@promo_access",
                "@onboarding_completed",
              ]);
              await setIsOnboardingComplete(false);
              router.replace("/(onboarding)" as any);
            } catch (error) {
              Alert.alert(
                i18n.t("tabs:common_error"),
                i18n.t("tabs:profile_reset_goals_failed")
              );
            }
          },
        },
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      i18n.t("tabs:profile_contact_us"),
      i18n.t("tabs:profile_tiktok_dm"),
      [
        { text: i18n.t("tabs:common_cancel"), style: "cancel" },
        {
          text: i18n.t("tabs:profile_open_tiktok"),
          onPress: () => {
            Linking.openURL("https://www.tiktok.com/@gotallapp").catch(() => {
              Alert.alert(
                i18n.t("tabs:profile_tiktok_fallback_title"),
                i18n.t("tabs:profile_tiktok_fallback_message"),
                [{ text: i18n.t("tabs:common_ok") }]
              );
            });
          },
        },
      ]
    );
  };

  const handleRestorePurchase = () => {
    Alert.alert(
      i18n.t("tabs:profile_restore_purchase"),
      i18n.t("tabs:profile_restore_purchase_message"),
      [{ text: i18n.t("tabs:common_ok") }]
    );
  };

  const handleResetGoals = () => {
    Alert.alert(
      i18n.t("tabs:profile_reset_goals"),
      i18n.t("tabs:profile_reset_goals_confirm"),
      [
        { text: i18n.t("tabs:common_cancel"), style: "cancel" },
        {
          text: i18n.t("tabs:common_reset"),
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all goals
              await databaseManager.purgeAllGoals();
              // Recreate default goals
              await databaseManager.insertDefaultGoals();
              Alert.alert(
                i18n.t("tabs:common_success"),
                i18n.t("tabs:profile_reset_goals_success")
              );
            } catch (error) {
              console.error("Error resetting goals:", error);
              Alert.alert(
                i18n.t("tabs:common_error"),
                i18n.t("tabs:profile_reset_goals_failed")
              );
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      icon: "help-circle-outline",
      title: i18n.t("tabs:profile_help_support"),
      subtitle: i18n.t("tabs:profile_get_assistance"),
      onPress: handleHelpSupport,
    },
    {
      icon: "trash-outline",
      title: i18n.t("tabs:profile_reset_goals"),
      subtitle: i18n.t("tabs:profile_reset_goals_sub"),
      onPress: handleResetGoals,
    },
    {
      icon: "refresh-outline",
      title: i18n.t("tabs:profile_restore_purchase"),
      subtitle: i18n.t("tabs:profile_restore_purchase_sub"),
      onPress: handleRestorePurchase,
    },
    {
      icon: "logo-discord",
      title: i18n.t("tabs:profile_promote_title"),
      subtitle: i18n.t("tabs:profile_promote_sub"),
      onPress: () => {
        Linking.openURL("https://discord.gg/a6j63JVuZ3").catch(() => {
          Alert.alert(
            i18n.t("tabs:profile_discord_title"),
            i18n.t("tabs:profile_discord_open_in_browser"),
            [{ text: i18n.t("tabs:common_ok") }]
          );
        });
      },
    },
  ];

  return (
    <View style={[styles.container]}>
      <Header title={i18n.t("tabs:profile_title")} showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={60} color="#9ACD32" />
            </View>
            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    {i18n.t("tabs:profile_height")}
                  </Text>
                  <Text style={styles.detailValue}>{getDisplayHeight()}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    {i18n.t("tabs:profile_weight")}
                  </Text>
                  <Text style={styles.detailValue}>{getDisplayWeight()}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    {i18n.t("tabs:profile_age")}
                  </Text>
                  <Text style={styles.detailValue}>{getAge()}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    {i18n.t("tabs:profile_sex")}
                  </Text>
                  <Text style={styles.detailValue}>
                    {userData.sex === "1"
                      ? i18n.t("tabs:profile_sex_male")
                      : i18n.t("tabs:profile_sex_female")}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    {i18n.t("tabs:profile_ethnicity")}
                  </Text>
                  <Text style={styles.detailValue}>{userData.ethnicity}</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={resetOnboarding}>
            <Text style={styles.editButtonText}>
              {i18n.t("tabs:profile_reset_profile")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Family Info */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>
            {i18n.t("tabs:profile_family_info")}
          </Text>
          <View style={styles.familyGrid}>
            <View style={styles.familyCard}>
              <Ionicons name="woman-outline" size={24} color="#9ACD32" />
              <Text style={styles.familyLabel}>Mother</Text>
              <Text style={styles.familyValue}>{getDisplayMotherHeight()}</Text>
            </View>
            <View style={styles.familyCard}>
              <Ionicons name="man-outline" size={24} color="#9ACD32" />
              <Text style={styles.familyLabel}>Father</Text>
              <Text style={styles.familyValue}>{getDisplayFatherHeight()}</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>
            {i18n.t("tabs:profile_preferences")}
          </Text>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>
              {i18n.t("tabs:profile_height_unit")}
            </Text>
            <Text style={styles.preferenceValue}>
              {userData.preferredHeightUnit === "ft"
                ? i18n.t("tabs:profile_unit_feet_inches")
                : i18n.t("tabs:profile_unit_centimeters")}
            </Text>
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>
              {i18n.t("tabs:profile_weight_unit")}
            </Text>
            <Text style={styles.preferenceValue}>
              {userData.preferredWeightUnit === "lbs"
                ? i18n.t("tabs:profile_unit_pounds")
                : i18n.t("tabs:profile_unit_kilograms")}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>
            {i18n.t("tabs:profile_settings")}
          </Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingIcon}>
                <Ionicons name={option.icon as any} size={22} color="#9ACD32" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>
            {i18n.t("tabs:profile_about")}
          </Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>
              {i18n.t("tabs:profile_app_name")}
            </Text>
            <Text style={styles.appVersion}>
              {i18n.t("tabs:profile_version", {
                version: Constants.expoConfig?.version || "1.0.2",
              })}
            </Text>
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() =>
                Linking.openURL(
                  "https://docs.google.com/document/d/16ZWdn9p2huxdIsVV51foFDPxCxMSuXofLxgY0A-BvTE/edit?usp=sharing"
                )
              }
            >
              <Text style={styles.privacyText}>
                {i18n.t("tabs:profile_privacy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() =>
                Linking.openURL(
                  "https://docs.google.com/document/d/1rg1W0ZepiwV48UTvXhDkiysV1bEg7u8TofQrQAJl1-Q/edit?usp=sharing"
                )
              }
            >
              <Text style={styles.privacyText}>
                {i18n.t("tabs:profile_terms")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={resetOnboarding}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>
            {i18n.t("tabs:profile_delete_account")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userSection: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  userHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(154, 205, 50, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
  },
  userDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginRight: 12,
  },
  detailLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: "center",
  },
  editButtonText: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "500",
  },
  familySection: {
    marginBottom: 30,
  },
  familyGrid: {
    flexDirection: "row",
    gap: 15,
  },
  familyCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  familyLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  familyValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  preferencesSection: {
    marginBottom: 30,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  preferenceLabel: {
    color: "#666",
    fontSize: 16,
  },
  preferenceValue: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "500",
  },
  quickStatsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  statValue: {
    color: "#9ACD32",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtitle: {
    color: "#666",
    fontSize: 14,
  },
  appInfoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  appVersion: {
    color: "#666",
    fontSize: 14,
    marginBottom: 12,
  },
  privacyLink: {
    marginTop: 8,
  },
  privacyText: {
    color: "#9ACD32",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  logoutText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

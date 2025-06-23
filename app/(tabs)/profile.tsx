import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../components/Header";
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
  const router = useRouter();

  useEffect(() => {
    // Reload user data when profile screen is loaded
    loadUserData();
  }, []);

  const resetOnboarding = async () => {
    Alert.alert(
      "Reset Profile",
      "This will clear your profile data and restart the setup process. When prompted to pay, just swipe away the app and restart it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "@onboarding_completed",
                "@user_height_cm",
                "@user_date_of_birth",
                "@user_sex",
                "@user_weight",
                "@user_mother_height_cm",
                "@user_father_height_cm",
                "@user_ethnicity",
                "@user_preferred_weight_unit",
                "@user_preferred_height_unit",
              ]);
              router.replace("/(onboarding)" as any);
            } catch (error) {
              Alert.alert("Error", "Failed to reset profile data");
            }
          },
        },
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      "Contact Us",
      "DM and follow us on TikTok @gotallapp for support and updates!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open TikTok",
          onPress: () => {
            Linking.openURL("https://www.tiktok.com/@gotallapp").catch(() => {
              // If TikTok app/URL fails, show another alert with the handle
              Alert.alert("TikTok", "Find us on TikTok: @gotallapp", [
                { text: "OK" },
              ]);
            });
          },
        },
      ]
    );
  };

  const handleRestorePurchase = () => {
    Alert.alert(
      "Restore Purchase",
      "Please close and restart the app after tapping OK.",
      [{ text: "OK" }]
    );
  };

  const settingsOptions = [
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get assistance",
      onPress: handleHelpSupport,
    },
    {
      icon: "refresh-outline",
      title: "Restore Purchase",
      subtitle: "Restore your purchase",
      onPress: handleRestorePurchase,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" showBackButton={false} />
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
                  <Text style={styles.detailLabel}>Height</Text>
                  <Text style={styles.detailValue}>{getDisplayHeight()}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{getDisplayWeight()}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{getAge()}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sex</Text>
                  <Text style={styles.detailValue}>
                    {userData.sex === "1" ? "Male" : "Female"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Ethnicity</Text>
                  <Text style={styles.detailValue}>{userData.ethnicity}</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={resetOnboarding}>
            <Text style={styles.editButtonText}>Reset Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Family Info */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>Family Information</Text>
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
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Height Unit:</Text>
            <Text style={styles.preferenceValue}>
              {userData.preferredHeightUnit === "ft"
                ? "Feet & Inches"
                : "Centimeters"}
            </Text>
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Weight Unit:</Text>
            <Text style={styles.preferenceValue}>
              {userData.preferredWeightUnit === "lbs" ? "Pounds" : "Kilograms"}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
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
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Posture Tracker</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() =>
                Linking.openURL(
                  "https://docs.google.com/document/d/16ZWdn9p2huxdIsVV51foFDPxCxMSuXofLxgY0A-BvTE/edit?usp=sharing"
                )
              }
            >
              <Text style={styles.privacyText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={resetOnboarding}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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

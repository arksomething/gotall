import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      "This will clear your profile data and restart the setup process. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "@onboarding_completed",
                "@user_name",
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
              router.replace("/onboarding");
            } catch (error) {
              Alert.alert("Error", "Failed to reset profile data");
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage your alerts",
    },
    {
      icon: "time-outline",
      title: "Reminders",
      subtitle: "Set posture check times",
    },
    {
      icon: "stats-chart-outline",
      title: "Goals",
      subtitle: "Customize your targets",
    },
    { icon: "color-palette-outline", title: "Theme", subtitle: "Dark mode" },
    {
      icon: "download-outline",
      title: "Export Data",
      subtitle: "Download your progress",
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get assistance",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9ACD32" />
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userDetails}>
            {getDisplayHeight()} • Age: {getAge()} • {getDisplayWeight()}
          </Text>
          <Text style={styles.userSex}>
            {userData.sex === "1" ? "Male" : "Female"} • {userData.ethnicity}
          </Text>
          <TouchableOpacity style={styles.editButton} onPress={resetOnboarding}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
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

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Streaks</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.settingItem}>
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
            <TouchableOpacity style={styles.feedbackButton}>
              <Text style={styles.feedbackText}>Send Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "#9ACD32",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userDetails: {
    color: "#666",
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  userSex: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
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
    marginBottom: 15,
  },
  feedbackButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  feedbackText: {
    color: "#9ACD32",
    fontSize: 12,
    fontWeight: "500",
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

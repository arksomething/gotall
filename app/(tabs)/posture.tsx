import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function PostureScreen() {
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(30); // minutes
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const intervalOptions = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hour" },
  ];

  useEffect(() => {
    // Request notification permissions
    requestPermissions();

    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.actionIdentifier === "restart") {
          startReminder();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to receive posture reminders.",
        [{ text: "OK" }]
      );
    }
  };

  const startReminder = async () => {
    try {
      // Cancel existing reminder
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      // Schedule repeating notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Posture Check! 🧘‍♀️",
          body: "Time to check your posture!\n• Shoulders back\n• Chin tucked\n• Spine straight",
          sound: true,
          data: { type: "posture_reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: reminderInterval * 60,
          repeats: true,
        },
      });

      setNotificationId(id);
      setReminderActive(true);

      Alert.alert(
        "Reminder Started! ✅",
        `You'll receive posture reminders every ${reminderInterval} minutes, even when the app is closed.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error starting reminder:", error);
      Alert.alert("Error", "Failed to start reminder");
    }
  };

  const stopReminder = async () => {
    try {
      // Cancel ALL scheduled notifications to ensure complete cleanup
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotificationId(null);
      setReminderActive(false);

      Alert.alert(
        "All Reminders Killed ⏹️",
        "All posture reminders have been completely disabled.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error stopping reminders:", error);
    }
  };

  const updateInterval = async (minutes: number) => {
    setReminderInterval(minutes);

    // If reminder is active, restart with new interval
    if (reminderActive) {
      await stopReminder();
      setTimeout(() => {
        startReminder();
      }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posture Reminders</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Section */}
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Stay on top of your posture</Text>
          <Text style={styles.sectionSubtitle}>
            Get notified even when the app is closed
          </Text>
        </View>

        {/* Interval Selection */}
        <View style={styles.intervalContainer}>
          <Text style={styles.intervalLabel}>Reminder every:</Text>
          <View style={styles.intervalOptions}>
            {intervalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.intervalButton,
                  reminderInterval === option.value && styles.selectedInterval,
                ]}
                onPress={() => updateInterval(option.value)}
              >
                <Text
                  style={[
                    styles.intervalButtonText,
                    reminderInterval === option.value &&
                      styles.selectedIntervalText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer Status */}
        <View style={styles.timerStatus}>
          <View style={styles.statusRow}>
            <Ionicons
              name={reminderActive ? "notifications" : "notifications-off"}
              size={24}
              color={reminderActive ? "#9ACD32" : "#666"}
            />
            <Text
              style={[
                styles.statusText,
                { color: reminderActive ? "#9ACD32" : "#666" },
              ]}
            >
              {reminderActive ? "Reminders Active" : "Reminders Off"}
            </Text>
          </View>
          {reminderActive && (
            <Text style={styles.statusSubtext}>
              Next reminder in {reminderInterval} minutes
            </Text>
          )}
        </View>

        {/* Timer Controls */}
        <View style={styles.timerControls}>
          {!reminderActive ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startReminder}
            >
              <Ionicons
                name="play"
                size={20}
                color="#000"
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>Start Reminders</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopReminder}>
              <Ionicons
                name="stop"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.stopButtonText}>Stop Reminders</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#9ACD32"
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Reminder Tips</Text>
            <Text style={styles.infoText}>
              • Shoulders back and down{"\n"}• Chin tucked slightly{"\n"}• Spine
              straight{"\n"}• Feet flat on floor
            </Text>
          </View>
        </View>
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
  mainSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  intervalContainer: {
    marginBottom: 40,
  },
  intervalLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  intervalOptions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  intervalButton: {
    backgroundColor: "#111",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#333",
  },
  selectedInterval: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  intervalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedIntervalText: {
    color: "#000",
  },
  timerStatus: {
    marginBottom: 30,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  statusSubtext: {
    color: "#666",
    fontSize: 14,
    marginLeft: 36,
  },
  timerControls: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#9ACD32",
    borderRadius: 25,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  stopButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 25,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    marginBottom: 30,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
});

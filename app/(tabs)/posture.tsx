import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/Header";

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
  const [reminderInterval, setReminderInterval] = useState(20); // minutes
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const intervalOptions = [
    { value: 20, label: "20 min" },
    { value: 60, label: "1 hour" },
    { value: 180, label: "3 hours" },
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
          body: "Time to check your posture and sit up straight!",
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
    <View style={[styles.container]}>
      <Header
        title="Posture"
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={reminderActive ? "notifications" : "notifications-off"}
              size={20}
              color={reminderActive ? "#9ACD32" : "#666"}
            />
            <Text
              style={[styles.cardTitle, reminderActive && styles.activeText]}
            >
              {reminderActive ? "Reminders Active" : "Reminders Disabled"}
            </Text>
          </View>
          {reminderActive && (
            <Text style={styles.cardSubtitle}>
              Checking every {reminderInterval} minutes
            </Text>
          )}
        </View>

        {/* Interval Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Frequency</Text>
          <View style={styles.intervalGrid}>
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

        {/* Control Button */}
        <TouchableOpacity
          style={[styles.controlButton, reminderActive && styles.stopButton]}
          onPress={reminderActive ? stopReminder : startReminder}
        >
          <Ionicons
            name={reminderActive ? "stop-circle" : "play-circle"}
            size={20}
            color={reminderActive ? "#000" : "#9ACD32"}
            style={styles.buttonIcon}
          />
          <Text
            style={[
              styles.controlButtonText,
              reminderActive && styles.stopButtonText,
            ]}
          >
            {reminderActive ? "Stop Reminders" : "Start Reminders"}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#666" />
            <Text style={styles.cardTitle}>How it works</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            You'll receive gentle reminders to check your posture throughout the
            day, even when the app is closed.
          </Text>
        </View>
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
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 12,
  },
  activeText: {
    color: "#9ACD32",
  },
  cardSubtitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 36,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  intervalGrid: {
    flexDirection: "row",
    gap: 8,
  },
  intervalButton: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  selectedInterval: {
    backgroundColor: "#9ACD32",
  },
  intervalButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedIntervalText: {
    color: "#000",
    fontWeight: "600",
  },
  controlButton: {
    backgroundColor: "#111",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stopButton: {
    backgroundColor: "#9ACD32",
  },
  buttonIcon: {
    marginRight: 8,
  },
  controlButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  stopButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});

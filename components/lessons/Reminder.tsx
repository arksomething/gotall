import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ReminderStep } from "../../utils/lessonTypes";
import { TimePicker } from "../TimePicker";

interface Props {
  step: ReminderStep;
}

export default function Reminder({ step }: Props) {
  const [scheduled, setScheduled] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState(step.time || "09:00");

  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        const time = `${hour}:${minute}`;
        options.push({ label: time, value: time });
      }
    }
    return options;
  }, []);

  useEffect(() => {
    const checkForExistingReminder = async () => {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const existingNotification = scheduledNotifications.find(
        (notif) => (notif.content.data as any)?.reminderTitle === step.title
      );

      if (existingNotification) {
        setScheduled(true);
        setNotificationId(existingNotification.identifier);
      }
    };

    checkForExistingReminder();
  }, [step.title]);

  const handleToggleReminder = async () => {
    if (scheduled && notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      setScheduled(false);
      setNotificationId(null);
      alert("Reminder cancelled.");
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("You need to enable notifications to set a reminder.");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (reminderTime) {
      const [hour, minute] = reminderTime.split(":").map(Number);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: step.title,
          body: step.prompt,
          data: { reminderTitle: step.title },
        },
        trigger: {
          channelId: "default",
          hour,
          minute,
          repeats: true,
        },
      });
      setNotificationId(identifier);
      setScheduled(true);
      alert(`Reminder set for ${reminderTime} daily!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>
        <View style={styles.pickerContainer}>
          <TimePicker
            selectedValue={reminderTime}
            onValueChange={setReminderTime}
            items={timeOptions}
            containerStyle={styles.picker}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            scheduled && styles.updateButtonDisabled,
          ]}
          onPress={handleToggleReminder}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={scheduled ? "#fff" : "#000"}
          />
          <Text
            style={[
              styles.updateButtonText,
              { color: scheduled ? "#fff" : "#000" },
            ]}
          >
            {scheduled
              ? `CANCEL REMINDER (${reminderTime})`
              : `REMIND ME AT ${reminderTime}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  cardStyle: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 30,
  },
  picker: {
    width: "100%",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9ACD32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 120,
    justifyContent: "center",
  },
  updateButtonDisabled: {
    backgroundColor: "#666",
  },
  updateButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

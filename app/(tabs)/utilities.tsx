import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/Header";

const { width: screenWidth } = Dimensions.get("window");

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function UtilitiesScreen() {
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(20); // minutes
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const intervalOptions = [
    { value: 20, label: "20 min" },
    { value: 60, label: "1 hour" },
    { value: 180, label: "3 hours" },
  ];

  const pages = [
    {
      id: "posture",
      title: "Posture Reminders",
      icon: "checkmark-circle-outline",
    },
    {
      id: "discord",
      title: "Community",
      icon: "people-outline",
    },
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

  const openDiscord = async () => {
    const discordUrl = "https://discord.gg/k34yvPtM73";
    try {
      await Linking.openURL(discordUrl);
    } catch (error) {
      Alert.alert("Error", "Could not open Discord link");
    }
  };

  const renderPosturePage = () => (
    <View style={styles.pageContainer}>
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

        
      </ScrollView>
    </View>
  );

  const renderDiscordPage = () => (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Discord Community Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="logo-discord" size={24} color="#5865F2" />
            <Text style={styles.cardTitle}>Join Our Community</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Connect with fellow learners, share progress, and get support from
            the GoTall community.
          </Text>
        </View>

        {/* Discord Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll find</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#9ACD32" />
              <Text style={styles.featureText}>
                Community support & motivation
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={20} color="#9ACD32" />
              <Text style={styles.featureText}>Tips & tricks from members</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={20} color="#9ACD32" />
              <Text style={styles.featureText}>Progress celebrations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="help-circle" size={20} color="#9ACD32" />
              <Text style={styles.featureText}>Q&A with experts</Text>
            </View>
          </View>
        </View>

        {/* Join Button */}
        <TouchableOpacity style={styles.discordButton} onPress={openDiscord}>
          <Ionicons name="logo-discord" size={24} color="#fff" />
          <Text style={styles.discordButtonText}>Join Discord Community</Text>
        </TouchableOpacity>

        
      </ScrollView>
    </View>
  );

  const renderPage = ({ item }: { item: any }) => {
    switch (item.id) {
      case "posture":
        return renderPosturePage();
      case "discord":
        return renderDiscordPage();
      default:
        return null;
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <View style={[styles.container]}>
      <Header
        title="Utilities"
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

      {/* Page Indicators */}
      <View style={styles.pageIndicatorContainer}>
        {pages.map((page, index) => (
          <TouchableOpacity
            key={page.id}
            style={[
              styles.pageIndicator,
              currentPage === index && styles.activePageIndicator,
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            <Ionicons
              name={page.icon as any}
              size={16}
              color={currentPage === index ? "#9ACD32" : "#666"}
            />
            <Text
              style={[
                styles.pageIndicatorText,
                currentPage === index && styles.activePageIndicatorText,
              ]}
            >
              {page.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipable Pages */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  pageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#111",
    gap: 6,
  },
  activePageIndicator: {
    backgroundColor: "#222",
  },
  pageIndicatorText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  activePageIndicatorText: {
    color: "#9ACD32",
  },
  flatList: {
    flex: 1,
  },
  pageContainer: {
    width: screenWidth,
    flex: 1,
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
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  discordButton: {
    backgroundColor: "#5865F2",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 8,
  },
  discordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logScreenView } from "../../utils/FirebaseAnalytics";
import { logger } from "../../utils/Logger";
import i18n from "../../utils/i18n";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!pathname) return;
    const name = pathname.split("/").filter(Boolean).pop() || "tabs";
    logScreenView(name);
    // Track tab and screen context
    const tab = ["index", "coach", "roadmap", "progress", "utilities"].includes(
      name
    )
      ? name
      : undefined;
    if (tab) logger.trackTab(tab);
    logger.trackScreen(name, { group: "tabs", tab });
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#9ACD32",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#333",
          borderTopColor: "#444",
          borderTopWidth: 1,
          height: Platform.select({
            ios: 85,
            android: 60 + insets.bottom,
          }),
          paddingBottom: Platform.select({
            ios: 30,
            android: insets.bottom,
          }),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: Platform.OS === "android" ? 5 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t("tabs:home_title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: i18n.t("tabs:coach_title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: i18n.t("tabs:roadmap_title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: i18n.t("tabs:progress_title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="utilities"
        options={{
          title: i18n.t("tabs:utilities_title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // Hide from the tab bar but keep the route accessible
          href: null,
        }}
      />
      <Tabs.Screen
        name="lesson"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

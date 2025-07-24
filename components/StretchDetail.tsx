import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Stretch } from "../utils/stretches";

const { width: screenWidth } = Dimensions.get("window");

interface StretchDetailProps {
  stretch: Stretch;
}

export default function StretchDetail({ stretch }: StretchDetailProps) {
  const getYouTubeEmbedUrl = (videoId: string) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;

  return (
    <View style={styles.container}>
      {/* Header with name & emoji */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{stretch.name}</Text>
        <Text style={styles.emoji}>{stretch.emoji}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Video */}
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: getYouTubeEmbedUrl(stretch.youtubeId) }}
            style={styles.webView}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          {stretch.description.map((step, idx) => (
            <Text key={idx} style={styles.instructionStep}>
              {idx + 1}. {step}
            </Text>
          ))}
        </View>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <Ionicons name="repeat" size={16} color="#9ACD32" />
          <Text style={styles.metaText}>{stretch.sets} set(s)</Text>
          <Ionicons
            name="time"
            size={16}
            color="#9ACD32"
            style={{ marginLeft: 12 }}
          />
          <Text style={styles.metaText}>{stretch.durationSeconds} s</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  emoji: {
    fontSize: 28,
  },
  scroll: {
    flex: 1,
  },
  videoContainer: {
    width: screenWidth - 48,
    height: (screenWidth - 48) * (9 / 16),
    alignSelf: "center",
    marginBottom: 16,
  },
  webView: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  instructionsContainer: {
    paddingHorizontal: 24,
  },
  instructionStep: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 12,
  },
  metaText: {
    color: "#9ACD32",
    fontSize: 16,
    marginLeft: 4,
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { VideoStep } from "../../utils/lessonTypes";

interface Props {
  step: VideoStep;
}

// Function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (videoId: string) => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
};

// Function to check if video is a YouTube Short based on URL format
const isYouTubeShort = (youtubeUrl: string) => {
  return youtubeUrl.includes("/shorts/");
};

export default function Video({ step }: Props) {
  const isShort = isYouTubeShort(step.youtubeUrl);

  return (
    <View
      style={[
        styles.videoContainer,
        isShort ? styles.shortsContainer : styles.regularContainer,
      ]}
    >
      <WebView
        source={{ uri: getYouTubeEmbedUrl(step.youtubeId) }}
        style={styles.webView}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  regularContainer: {
    height: 250, // Increased from 200 to 250 for regular videos
  },
  shortsContainer: {
    height: 444, // Increased from 355 to 444 for Shorts (250 * 16/9)
    width: 250, // Increased from 200 to 250 for Shorts
    alignSelf: "center",
  },
  webView: {
    flex: 1,
  },
});

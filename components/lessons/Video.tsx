import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { VideoStep } from "../../utils/lessonTypes";

interface Props {
  step: VideoStep;
}

export default function Video({ step }: Props) {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: step.url }} style={styles.video} />
      <Text style={styles.text}>{step.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  video: {
    height: 200,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

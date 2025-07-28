import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArticleStep } from "../../utils/lessonTypes";

interface Props {
  step: ArticleStep;
}

export default function Article({ step }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{step.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
});

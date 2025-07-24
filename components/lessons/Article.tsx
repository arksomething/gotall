import React from "react";
import { StyleSheet, Text } from "react-native";
import { TextStep } from "../../utils/lessonTypes";

interface Props {
  step: TextStep;
}

export default function Article({ step }: Props) {
  return <Text style={styles.text}>{step.markdown}</Text>;
}

const styles = StyleSheet.create({
  text: { color: "#fff", fontSize: 16, marginBottom: 12 },
});

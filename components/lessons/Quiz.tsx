import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { QuizStep } from "../../utils/lessonTypes";

interface Props {
  step: QuizStep;
}

export default function Quiz({ step }: Props) {
  return (
    <View>
      <Text style={[styles.text, styles.prompt]}>{step.prompt}</Text>
      {step.choices.map((choice, idx) => (
        <Text key={idx} style={styles.text}>
          • {choice}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: "#fff", fontSize: 16, marginBottom: 12 },
  prompt: { fontWeight: "600", marginBottom: 16 },
});

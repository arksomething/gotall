import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { QuizStep } from "../../utils/lessonTypes";

interface Props {
  step: QuizStep;
}

export default function Quiz({ step }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{step.prompt}</Text>
      <View style={styles.choicesContainer}>
        {step.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = step.answer === idx;
          const buttonStyle = [
            styles.choiceButton,
            isSelected &&
              (isCorrect ? styles.correctButton : styles.incorrectButton),
            answered && isCorrect && styles.correctButton,
          ];
          const textStyle = [
            styles.choiceText,
            isSelected &&
              (isCorrect ? styles.correctText : styles.incorrectText),
            answered && isCorrect && styles.correctText,
          ];

          return (
            <TouchableOpacity
              key={idx}
              style={buttonStyle}
              onPress={() => handleAnswer(idx)}
              disabled={answered}
            >
              <Text style={textStyle}>{choice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && (
        <Text style={styles.explanation}>
          {selected === step.answer
            ? "Correct!"
            : `The correct answer is: ${step.choices[step.answer]}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  prompt: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  choiceText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  correctButton: {
    backgroundColor: "rgba(154, 205, 50, 0.2)",
    borderColor: "#9ACD32",
  },
  correctText: {
    color: "#9ACD32",
    fontWeight: "bold",
  },
  incorrectButton: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderColor: "#FF6B6B",
  },
  incorrectText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  explanation: {
    color: "#9ACD32",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
});

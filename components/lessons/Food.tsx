import React from "react";
import { StyleSheet, View } from "react-native";
import { FOOD_ANALYSIS_PROMPT } from "../../utils/prompts";
import { AnalysisCard } from "../AnalysisCard";

export default function Food() {
  return (
    <View style={styles.container}>
      <AnalysisCard
        endpoint="https://us-central1-gotall.cloudfunctions.net/foodAnalyzer"
        prompt={FOOD_ANALYSIS_PROMPT}
        analyzeButtonText="Analyze Meal"
        maxImages={3}
        placeholderText="Max three photos"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

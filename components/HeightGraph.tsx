import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

interface HeightGraphProps {
  currentHeight: string;
  potentialHeight: string;
  actualHeight: string;
}

export const HeightGraph = ({
  currentHeight = "4'10\"",
  potentialHeight = "5'11\"",
  actualHeight = "5'7\"",
}: HeightGraphProps) => {
  const windowWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
    <Text style={styles.headerText}>
      <Text>GoTall is powered by the </Text>
      <Text style={styles.highlight}>CDC</Text>
      <Text> dataset, creating </Text>
      <Text style={styles.highlight}>useful</Text>
      <Text> and </Text>
      <Text style={styles.highlight}>accurate</Text>
      <Text> predictions.</Text>
    </Text>
    <View style={styles.heightRow}>
      <Text style={[styles.heightLabel, styles.potentialLabel]}>
        Your true potential is:
      </Text>
      <View style={styles.heightBoxContainer}>
        <View style={styles.heightBox}>
          <Text style={styles.heightText}>{potentialHeight}</Text>
        </View>
      </View>
    </View>
    <View style={styles.trackRow}>
      <Text style={styles.heightLabel}>But you're on track to be</Text>
      <Text style={[styles.heightText, styles.trackHeight]}>{actualHeight}</Text>
    </View>
  </View>
      <Image
        source={require("../assets/images/Frame 8.png")}
        style={[styles.image, { width: windowWidth - 32 }]}
        resizeMode="contain"
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.currentDot]} />
          <Text style={[styles.legendText, styles.currentText]}>
            Current Height: {currentHeight}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.actualDot]} />
          <Text style={[styles.legendText, styles.actualText]}>
            Projected Height: {actualHeight}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.potentialDot]} />
          <Text style={[styles.legendText, styles.potentialLegendText]}>
            True Potential: {potentialHeight}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#000",
    paddingBottom: 16,
  },
  headerContainer: {
    width: "100%",
    padding: 16,
  },
  headerText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    marginBottom: 24,
  },
  highlight: {
    color: "#9ACD32",
  },
  heightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heightLabel: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "500",
  },
  potentialLabel: {
    color: "#FFF",
  },
  heightBoxContainer: {
    position: "relative",
  },
  heightBox: {
    backgroundColor: "#9ACD32",
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    alignItems: "center",
    marginLeft: 10,
  },
  heightText: {
    color: "#000",
    fontSize: 28,
    fontWeight: "bold",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trackHeight: {
    color: "#9ACD32",
  },
  image: {
    height: 300,
  },
  legend: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    fontWeight: "500",
  },
  currentDot: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#666",
  },
  currentText: {
    color: "#FFFFFF",
  },
  actualDot: {
    backgroundColor: "#9ACD32",
  },
  actualText: {
    color: "#9ACD32",
  },
  potentialDot: {
    backgroundColor: "#96437B",
  },
  potentialLegendText: {
    color: "#96437B",
  },
});

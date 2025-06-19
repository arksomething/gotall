import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import heightData from "../utils/data.json";

interface GraphProps {
  sex: "1" | "2"; // 1 for male, 2 for female
  age: number; // age in months
  currentHeight: number; // current height in cm
}

interface HeightDataPoint {
  Sex: string;
  Agemos: string;
  L: string;
  M: string;
  S: string;
  P3: string;
  P5: string;
  P10: string;
  P25: string;
  P50: string;
  P75: string;
  P90: string;
  P95: string;
  P97: string;
}

const Graph: React.FC<GraphProps> = ({ sex, age, currentHeight }) => {
  const screenWidth = Dimensions.get("window").width;

  // Filter data for the specified sex and age range
  const getAgeRangeData = () => {
    let startAge: number;
    const maxDataAge = 240.5; // Max age in the CDC data is 20 years (240.5 months)
    const endAge = maxDataAge; // End at user's age or max data age

    if (age < 60) {
      // For children under 5 years old
      startAge = Math.max(24, age - 12);
    } else if (age > maxDataAge) {
      // If user is older than data, show the last 3 years of data
      startAge = maxDataAge - 36;
    } else {
      // For older children/adults, use a 3-year range before their current age
      startAge = Math.max(24, age - 36);
    }

    return (heightData as HeightDataPoint[])
      .filter(
        (item) =>
          item.Sex === sex &&
          parseFloat(item.Agemos) >= startAge &&
          parseFloat(item.Agemos) <= endAge
      )
      .sort((a, b) => parseFloat(a.Agemos) - parseFloat(b.Agemos));
  };

  // Calculate which percentile the current height falls into
  const calculatePercentile = () => {
    // Find the closest age data point, as an exact match is not guaranteed
    const closestDataPoint = (heightData as HeightDataPoint[])
      .filter((item) => item.Sex === sex)
      .reduce((prev, curr) => {
        const prevDiff = Math.abs(parseFloat(prev.Agemos) - age);
        const currDiff = Math.abs(parseFloat(curr.Agemos) - age);
        return currDiff < prevDiff ? curr : prev;
      });

    if (!closestDataPoint) return null;

    const percentiles = [
      { name: "P3", value: parseFloat(closestDataPoint.P3) },
      { name: "P5", value: parseFloat(closestDataPoint.P5) },
      { name: "P10", value: parseFloat(closestDataPoint.P10) },
      { name: "P25", value: parseFloat(closestDataPoint.P25) },
      { name: "P50", value: parseFloat(closestDataPoint.P50) },
      { name: "P75", value: parseFloat(closestDataPoint.P75) },
      { name: "P90", value: parseFloat(closestDataPoint.P90) },
      { name: "P95", value: parseFloat(closestDataPoint.P95) },
      { name: "P97", value: parseFloat(closestDataPoint.P97) },
    ];

    if (currentHeight < percentiles[0].value) {
      return {
        range: "Below P3",
        lowerBound: null,
        upperBound: percentiles[0],
        lowerName: "Below",
        upperName: "P3",
      };
    }
    if (currentHeight > percentiles[8].value) {
      return {
        range: "Above P97",
        lowerBound: percentiles[8],
        upperBound: null,
        lowerName: "P97",
        upperName: "Above",
      };
    }

    for (let i = 0; i < percentiles.length - 1; i++) {
      if (
        currentHeight >= percentiles[i].value &&
        currentHeight <= percentiles[i + 1].value
      ) {
        return {
          range: `${percentiles[i].name} - ${percentiles[i + 1].name}`,
          lowerBound: percentiles[i],
          upperBound: percentiles[i + 1],
          lowerName: percentiles[i].name,
          upperName: percentiles[i + 1].name,
        };
      }
    }

    return {
      range: "P50",
      lowerBound: percentiles[4],
      upperBound: percentiles[4],
      lowerName: "P50",
      upperName: "P50",
    }; // Default to median
  };

  const ageRangeData = getAgeRangeData();
  const userPercentileInfo = calculatePercentile();

  if (ageRangeData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Height Percentile Chart</Text>
        <Text style={styles.noData}>No data available for this age range</Text>
      </View>
    );
  }

  // Prepare chart data with fewer data points
  const filteredData = ageRangeData.filter((_, index) => index % 2 === 0); // Take every 2nd point for better density

  const labels = filteredData.map((item) =>
    Math.floor(parseFloat(item.Agemos) / 12).toString()
  );

  // Create current height line - show as a horizontal line at the user's height
  const currentHeightLine = filteredData.map(() => currentHeight);

  // Calculate optimal chart width and height - make it more vertical
  const chartWidth = screenWidth - 40; // Much wider to match daily tasks width
  const chartHeight = 320; // Much taller chart

  // Build datasets based on user's percentile band
  const datasets = [];

  if (userPercentileInfo) {
    // Add lower bound line if it exists
    if (userPercentileInfo.lowerBound) {
      const lowerData = filteredData.map((item) =>
        parseFloat(
          item[
            userPercentileInfo.lowerBound.name as keyof HeightDataPoint
          ] as string
        )
      );
      datasets.push({
        data: lowerData,
        color: () => `rgba(0, 191, 255, 1)`, // Bright electric blue for lower bound - force full opacity
        strokeWidth: 3,
        withDots: false,
      });
    }

    // Add upper bound line if it exists and is different from lower bound
    if (
      userPercentileInfo.upperBound &&
      userPercentileInfo.upperBound !== userPercentileInfo.lowerBound
    ) {
      const upperData = filteredData.map((item) =>
        parseFloat(
          item[
            userPercentileInfo.upperBound.name as keyof HeightDataPoint
          ] as string
        )
      );
      datasets.push({
        data: upperData,
        color: () => `rgba(255, 69, 0, 1)`, // Bright orange-red for upper bound - force full opacity
        strokeWidth: 3,
        withDots: false,
      });
    }
  }

  // Always add the user's height line
  datasets.push({
    data: currentHeightLine,
    color: () => `rgba(0, 255, 127, 1)`, // Bright spring green for current height - force full opacity
    strokeWidth: 5,
    withDots: false,
    strokeDashArray: [8, 4], // More prominent dashed line
  });

  const chartData = {
    labels: labels.filter((_, index) => index % 4 === 0), // Show fewer labels to prevent crowding
    datasets: datasets,
  };

  const chartConfig = {
    backgroundColor: "#0a0a0a",
    backgroundGradientFrom: "#0a0a0a",
    backgroundGradientTo: "#0a0a0a",
    decimalPlaces: 0,
    color: () => `rgba(255, 255, 255, 0.1)`, // Very subtle horizontal grid lines
    labelColor: () => `rgba(240, 240, 240, 1)`, // Force full opacity for labels
    style: {
      borderRadius: 16,
      width: chartWidth,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#00ffff",
    },
    formatYLabel: (value: string) => `${Math.round(parseFloat(value))}`,
    paddingTop: 20, // Add padding above chart
    paddingBottom: 20, // Add padding below chart
    strokeWidth: 3, // Ensure stroke width is applied
    fillShadowGradient: "#000000", // Remove any shadow effects
    fillShadowGradientOpacity: 0, // No shadow opacity
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid lines
      stroke: "rgba(255, 255, 255, 0.1)", // Very subtle horizontal lines
      strokeWidth: 1,
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fill: "rgba(240, 240, 240, 1)",
    },
    propsForHorizontalLabels: {
      fontSize: 12,
      fill: "rgba(240, 240, 240, 1)",
    },
    hidePointsAtIndex: [], // Don't hide any points, but we're not using dots anyway
    withVerticalLines: false, // Remove vertical grid lines
    withHorizontalLines: true, // Keep horizontal grid lines
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Height Percentile Chart</Text>
      <Text style={styles.subtitle}>
        {sex === "1" ? "Male" : "Female"} • Age: {Math.floor(age / 12)} years{" "}
        {age % 12} months • Height: {currentHeight}cm
      </Text>
      <Text style={styles.rangeInfo}>
        Showing ages{" "}
        {Math.floor(
          ageRangeData[0]?.Agemos ? parseFloat(ageRangeData[0].Agemos) / 12 : 0
        )}{" "}
        -{" "}
        {Math.floor(
          ageRangeData[ageRangeData.length - 1]?.Agemos
            ? parseFloat(ageRangeData[ageRangeData.length - 1].Agemos) / 12
            : 0
        )}{" "}
        years
      </Text>

      <View style={styles.chartContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LineChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier={false}
            style={styles.chart}
          />
        </ScrollView>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          {userPercentileInfo && userPercentileInfo.lowerBound && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#00bfff" }]}
              />
              <Text style={styles.legendText}>
                {userPercentileInfo.lowerName}
              </Text>
            </View>
          )}
          {userPercentileInfo &&
            userPercentileInfo.upperBound &&
            userPercentileInfo.upperBound !== userPercentileInfo.lowerBound && (
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#ff4500" }]}
                />
                <Text style={styles.legendText}>
                  {userPercentileInfo.upperName}
                </Text>
              </View>
            )}
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#00ff7f" }]}
            />
            <Text style={styles.legendText}>Your Height</Text>
          </View>
        </View>
      </View>

      {userPercentileInfo && (
        <View style={styles.percentileContainer}>
          <Text style={styles.percentileTitle}>Your Height Percentile:</Text>
          <Text style={styles.percentileValue}>{userPercentileInfo.range}</Text>
          <Text style={styles.percentileDescription}>
            {userPercentileInfo.range.includes("P50")
              ? "You're at the average height for your age and sex"
              : userPercentileInfo.range.includes("Above P97")
              ? "You're taller than 97% of people your age and sex"
              : userPercentileInfo.range.includes("Below P3")
              ? "You're shorter than 97% of people your age and sex"
              : `You're within the ${userPercentileInfo.range} percentile range`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#1a1a2e",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "#00bfff",
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 4,
  },
  rangeInfo: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
    marginBottom: 8,
  },
  chartContainer: {
    marginVertical: 8,
    paddingVertical: 4,
    backgroundColor: "#0a0a0a",
    borderRadius: 16,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  chart: {
    marginVertical: 0,
    borderRadius: 16,
    backgroundColor: "#0a0a0a",
  },
  legendContainer: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    color: "#ffffff",
    fontSize: 12,
  },
  percentileContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
  },
  percentileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  percentileValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4bc0c0",
    marginBottom: 8,
  },
  percentileDescription: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 20,
  },
  noData: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    marginTop: 32,
  },
});

export default Graph;

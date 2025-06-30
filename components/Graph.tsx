import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import heightData from "../utils/data.json";
import { getHeightForInput } from "../utils/heightUtils";

interface GraphProps {
  sex: "1" | "2"; // 1 for male, 2 for female
  age: number; // age in months
  currentHeight: number; // current height in cm
  onPercentileCalculated?: (
    percentile: {
      range: string;
      lowerBound: { name: string; value: number; display: string } | null;
      upperBound: { name: string; value: number; display: string } | null;
      lowerName: string;
      upperName: string;
    } | null
  ) => void;
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

const Graph: React.FC<GraphProps> = ({
  sex,
  age,
  currentHeight,
  onPercentileCalculated,
}) => {
  const screenWidth = Dimensions.get("window").width;

  const graphConfig = {
    colors: {
      lower: "#B9E45F",
    },
  };

  // Filter data for the specified sex and age range
  const getAgeRangeData = () => {
    let startAge = 0;
    const maxDataAge = 240.5; // Max age in the CDC data is 20 years (240.5 months)
    const endAge = maxDataAge; // End at user's age or max data age

    if (age < 60) {
      // For children under 5 years old
      startAge = Math.max(24, age - 12);
    } else if (age > maxDataAge) {
      startAge = maxDataAge - 60;
    } else {
      startAge = Math.max(24, age - 60);
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

    const formatPercentile = (p: string) => {
      const num = parseInt(p.substring(1));
      if (num === 3) return "3rd";
      return `${num}th`;
    };

    const percentiles = [
      { name: "P3", value: parseFloat(closestDataPoint.P3), display: "3rd" },
      { name: "P5", value: parseFloat(closestDataPoint.P5), display: "5th" },
      { name: "P10", value: parseFloat(closestDataPoint.P10), display: "10th" },
      { name: "P25", value: parseFloat(closestDataPoint.P25), display: "25th" },
      { name: "P50", value: parseFloat(closestDataPoint.P50), display: "50th" },
      { name: "P75", value: parseFloat(closestDataPoint.P75), display: "75th" },
      { name: "P90", value: parseFloat(closestDataPoint.P90), display: "90th" },
      { name: "P95", value: parseFloat(closestDataPoint.P95), display: "95th" },
      { name: "P97", value: parseFloat(closestDataPoint.P97), display: "97th" },
    ];

    if (currentHeight < percentiles[0].value) {
      return {
        range: "Below 3rd percentile",
        lowerBound: null,
        upperBound: percentiles[0],
        lowerName: "Below",
        upperName: "3rd percentile",
      };
    }
    if (currentHeight > percentiles[8].value) {
      return {
        range: "Above 97th percentile",
        lowerBound: percentiles[8],
        upperBound: null,
        lowerName: "97th percentile",
        upperName: "Above",
      };
    }

    for (let i = 0; i < percentiles.length - 1; i++) {
      if (
        currentHeight >= percentiles[i].value &&
        currentHeight <= percentiles[i + 1].value
      ) {
        return {
          range: `${percentiles[i].display} - ${
            percentiles[i + 1].display
          } percentile`,
          lowerBound: percentiles[i],
          upperBound: percentiles[i + 1],
          lowerName: `${percentiles[i].display} percentile`,
          upperName: `${percentiles[i + 1].display} percentile`,
        };
      }
    }

    return {
      range: "50th percentile",
      lowerBound: percentiles[4],
      upperBound: percentiles[4],
      lowerName: "50th percentile",
      upperName: "50th percentile",
    }; // Default to median
  };

  const ageRangeData = getAgeRangeData();
  const userPercentileInfo = calculatePercentile();

  React.useEffect(() => {
    if (onPercentileCalculated) {
      onPercentileCalculated(userPercentileInfo);
    }
  }, [userPercentileInfo, onPercentileCalculated]);

  if (ageRangeData.length === 0) {
    return (
      <View style={styles.container}>
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
    // Find the closest percentile line
    let closestBound = null;
    let closestDistance = Infinity;

    if (userPercentileInfo.lowerBound) {
      const lowerDistance = Math.abs(
        userPercentileInfo.lowerBound.value - currentHeight
      );
      if (lowerDistance < closestDistance) {
        closestBound = userPercentileInfo.lowerBound;
        closestDistance = lowerDistance;
      }
    }

    if (userPercentileInfo.upperBound) {
      const upperDistance = Math.abs(
        userPercentileInfo.upperBound.value - currentHeight
      );
      if (upperDistance < closestDistance) {
        closestBound = userPercentileInfo.upperBound;
      }
    }

    // Add only the closest percentile line
    if (closestBound) {
      const percentileData = filteredData.map((item) =>
        parseFloat(item[closestBound.name as keyof HeightDataPoint] as string)
      );
      datasets.push({
        data: percentileData,
        color: () => graphConfig.colors.lower,
        strokeWidth: 3,
        withDots: false,
      });
    }
  }

  const chartData = {
    labels: labels.filter((_, index) => index % 4 === 0),
    datasets: datasets,
  };

  const chartConfig = {
    backgroundColor: "#000000",
    backgroundGradientFrom: "#000000",
    backgroundGradientTo: "#000000",
    decimalPlaces: 0,
    color: () => `rgba(255, 255, 255, 0.1)`,
    labelColor: () => `rgba(240, 240, 240, 1)`,
    style: {
      borderRadius: 16,
      width: chartWidth,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#00ffff",
    },
    formatYLabel: (value: string) => getHeightForInput(parseFloat(value), "ft"),
    paddingTop: 20,
    paddingBottom: 20,
    strokeWidth: 3,
    fillShadowGradient: "#000000",
    fillShadowGradientOpacity: 0,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "rgba(255, 255, 255, 0.1)",
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
    hidePointsAtIndex: [],
    withVerticalLines: false,
    withHorizontalLines: true,
  };

  // Calculate the percentile number once and reuse it
  const getPercentileNumber = () => {
    if (!userPercentileInfo) return null;

    if (userPercentileInfo.lowerBound && userPercentileInfo.upperBound) {
      return Math.abs(userPercentileInfo.lowerBound.value - currentHeight) <
        Math.abs(userPercentileInfo.upperBound.value - currentHeight)
        ? userPercentileInfo.lowerBound
        : userPercentileInfo.upperBound;
    }
    return userPercentileInfo.lowerBound || userPercentileInfo.upperBound;
  };

  const percentileNumber = getPercentileNumber();

  return (
    <View style={styles.container}>
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

      {/* Growth Stats */}
      <View style={styles.growthStatsContainer}>
        {/* Growth Completion */}
        <View style={styles.growthStat}>
          <View style={styles.growthProgressBar}>
            <View
              style={[
                styles.growthProgressFill,
                {
                  width: `${Math.min(100, (Math.floor(age / 12) / 21) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.growthText}>
            {Math.min(100, Math.round((Math.floor(age / 12) / 21) * 100))}% Done
            Growing
          </Text>
        </View>

        {/* Percentile Comparison */}
        <View style={styles.growthStat}>
          <Text style={styles.percentileText}>
            Shorter than{" "}
            <Text style={styles.percentileHighlight}>
              {percentileNumber
                ? 100 - parseInt(percentileNumber.display)
                : "--"}
              %
            </Text>
            {"\n"}of {Math.floor(age / 12)} year olds
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#000000",
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#1a1a2e",
    alignItems: "center",
  },
  chartContainer: {
    marginVertical: 0,
    paddingVertical: 4,
    backgroundColor: "#000000",
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  chart: {
    marginVertical: 0,
    borderRadius: 16,
    backgroundColor: "#000000",
  },
  growthStatsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
    width: "100%",
  },
  growthStat: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a1a2e",
    alignItems: "center",
  },
  growthProgressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#1a1a2e",
    borderRadius: 2,
    marginBottom: 8,
  },
  growthProgressFill: {
    height: "100%",
    backgroundColor: "#B9E45F",
    borderRadius: 2,
  },
  growthText: {
    color: "#B9E45F",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#B9E45F",
    textShadowRadius: 2,
  },
  percentileText: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  percentileHighlight: {
    color: "#B9E45F",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "#B9E45F",
    textShadowRadius: 2,
  },
  noData: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    marginTop: 32,
  },
});

export default Graph;

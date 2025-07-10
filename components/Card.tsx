import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface CardProps {
  label: string;
  value: string;
  subtext?: string;
  onPress?: () => void;
  variant?: "default" | "projected" | "touchable";
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  label,
  value,
  subtext,
  onPress,
  variant = "default",
  style,
}) => {
  const cardStyle = [
    styles.card,
    variant === "projected" && styles.projectedCard,
    style,
  ];

  const labelStyle = [
    styles.cardLabel,
    variant === "projected" && styles.projectedCardText,
  ];

  const valueStyle = [
    styles.cardValue,
    variant === "projected" && styles.projectedCardText,
  ];

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer style={cardStyle} onPress={onPress}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
      {subtext && <Text style={styles.cardSubtext}>{subtext}</Text>}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(154, 205, 50, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cardLabel: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  cardValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  cardSubtext: {
    color: "#9ACD32",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  projectedCard: {
    backgroundColor: "#9ACD32",
  },
  projectedCardText: {
    color: "#000",
  },
});

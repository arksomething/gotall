import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";

export default withOnboarding(ReviewsScreen, 10, "reviews", "short");

function ReviewsScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <OnboardingLayout
      title="Real Results"
      currentStep={10}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
    >
      <View style={styles.container}>
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>140+</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>⭐ Rating</Text>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>IN</Text>
            </View>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewName}>Ian N.</Text>
              <Text style={styles.reviewStats}>Age 16 • +1.3 inches</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>
            "Grew an inch since following the app's instructions. Looking
            forward to more results!"
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../../assets/images/pfp2.jpg")}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewName}>Daniil K.</Text>
              <Text style={styles.reviewStats}>Age 15 • +1.8 inches</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>
            "The thing is that I knew it was possible to grow taller, but I
            didn't know how - until this app just provided the structure I
            needed."
          </Text>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatarContainer}>
            <Image
                source={require("../../assets/images/pfp3.jpg")}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewName}>Bagkar N.</Text>
              <Text style={styles.reviewStats}>Age 17 • +1.5 inches</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>
            "I thought I was stuck with my height, but this app gave me new hope
            and now I'm excited to have the potential of growing."
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 16,
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  statLabel: {
    color: "#9ACD32",
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#9ACD32",
  },
  reviewCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9ACD32",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  reviewStats: {
    color: "#9ACD32",
    fontSize: 14,
  },
  reviewText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    fontStyle: "italic",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

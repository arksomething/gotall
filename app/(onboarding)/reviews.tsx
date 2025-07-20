import React from "react";
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { withOnboarding } from "../../components/withOnboarding";
import { useUnits } from "../../utils/useUnits";

export default withOnboarding(ReviewsScreen, 10, "reviews", "short");

function ReviewsScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const { gain } = useUnits();

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
            <Text style={styles.statNumber}>10,000+</Text>
            <Text style={styles.statLabel}>Community</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Image
              source={require("../../assets/images/starlaurel.png")}
              style={styles.laurelImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>IN</Text>
            </View>
            <View style={styles.reviewMeta}>
              <View style={styles.reviewTopLine}>
                <Text style={styles.reviewName}>Ian N.</Text>
                <Text style={styles.reviewInches}>{gain(1.3)}</Text>
              </View>
              <Text style={styles.reviewAge}>Age 16</Text>
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
              <View style={styles.reviewTopLine}>
                <Text style={styles.reviewName}>Daniil K.</Text>
                <Text style={styles.reviewInches}>{gain(1.8)}</Text>
              </View>
              <Text style={styles.reviewAge}>Age 15</Text>
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
              <View style={styles.reviewTopLine}>
                <Text style={styles.reviewName}>Bagkar N.</Text>
                <Text style={styles.reviewInches}>{gain(1.5)}</Text>
              </View>
              <Text style={styles.reviewAge}>Age 17</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>
            "I thought I was stuck with my height, but this app gave me new hope
            and now I'm excited to have the potential of growing."
          </Text>
        </View>
      </View>

      {/* Leave a Rating Button */}
      <TouchableOpacity
        style={styles.ratingButton}
        activeOpacity={0.8}
        onPress={() => {
          // Attempt to open app store rating page; fallback logs
          const url =
            Platform.OS === "ios"
              ? "https://apps.apple.com/us/app/gotall/id6747467975"
              : "https://play.google.com/store/apps/details?id=com.gotall.app";
          Linking.openURL(url).catch(() =>
            console.warn("Unable to open rating link")
          );
        }}
      >
        <Text style={styles.ratingButtonText}>Leave a Rating</Text>
      </TouchableOpacity>
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
    justifyContent: "center",
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
    marginHorizontal: 16,
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
  reviewTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  reviewName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewInches: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewAge: {
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
  laurelImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 2.5,
  },
  ratingButton: {
    backgroundColor: "#9ACD32",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  ratingButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

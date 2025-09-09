import * as StoreReview from "expo-store-review";
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
import i18n from "../../utils/i18n";
import { useUnits } from "../../utils/useUnits";

export default withOnboarding(ReviewsScreen, "reviews");

function ReviewsScreen({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const { gain } = useUnits();

  // Attempt to show the native in-app review dialog on screen load
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (!cancelled && isAvailable) {
          await StoreReview.requestReview();
        }
      } catch (e) {
        // Ignore errors; system may rate-limit or block the prompt
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OnboardingLayout
      title={i18n.t("onboarding:reviews_title")}
      onNext={onNext}
      onBack={onBack}
      showBackButton={true}
    >
      <View style={styles.container}>
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {i18n.t("onboarding:reviews_stat_number_community")}
            </Text>
            <Text style={styles.statLabel}>
              {i18n.t("onboarding:reviews_stat_label_community")}
            </Text>
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
            {i18n.t("onboarding:reviews_review_1_text")}
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
            {i18n.t("onboarding:reviews_review_2_text")}
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
            {i18n.t("onboarding:reviews_review_3_text")}
          </Text>
        </View>
      </View>

      {/* Leave a Rating Button */}
      <TouchableOpacity
        style={styles.ratingButton}
        activeOpacity={0.8}
        onPress={async () => {
          try {
            const isAvailable = await StoreReview.isAvailableAsync();
            if (isAvailable) {
              await StoreReview.requestReview();
              return; // Let the system decide whether to show the prompt
            }
          } catch (e) {
            // Ignore and fallback to store page
          }
          // Fallback: open store listing
          const url =
            Platform.OS === "ios"
              ? "https://apps.apple.com/us/app/gotall/id6747467975"
              : "https://play.google.com/store/apps/details?id=com.gotall.app";
          Linking.openURL(url).catch(() =>
            console.warn("Unable to open rating link")
          );
        }}
      >
        <Text style={styles.ratingButtonText}>
          {i18n.t("onboarding:reviews_button_leave_rating")}
        </Text>
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

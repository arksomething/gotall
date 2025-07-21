import Constants from "expo-constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";
import { crashlytics } from "../../utils/crashlytics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 3000; // Time between auto-scrolls in milliseconds

const carouselData = [
  {
    image: require("../../assets/images/onboarding/Index.png"),
    text: "Track your current height and see your projected growth potential with our advanced prediction model.",
    aspectRatio: 0.5,
  },
  {
    image: require("../../assets/images/onboarding/Goals.png"),
    text: "Set and track daily goals including sleep, nutrition, and stretching exercises to optimize your growth.",
    aspectRatio: 0.5,
  },
  {
    image: require("../../assets/images/onboarding/Coach.png"),
    text: "Get personalized coaching and support from our in-app coach to help you achieve your height goals.",
    aspectRatio: 0.5,
  },
];

function WelcomeScreen({ onNext }: OnboardingScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();
  const HERO_HEIGHT = screenHeight - insets.top - 280; // subtract approximate bottom panel height

  // Add logging for debugging
  useEffect(() => {
    crashlytics.logMessage("WelcomeScreen mounted");
    crashlytics.setCustomKey("screen", "onboarding_index");
    crashlytics.setCustomKey("safe_area_top", insets.top.toString());
    crashlytics.setCustomKey(
      "screen_dimensions",
      `${screenWidth}x${screenHeight}`
    );

    // Add Expo-specific logging
    console.log("Expo Debug Info:", {
      expoVersion: Constants.expoConfig?.version,
      platform: Constants.platform,
      deviceName: Constants.deviceName,
      deviceYearClass: Constants.deviceYearClass,
      isDevice: Constants.isDevice,
      appOwnership: Constants.appOwnership,
      installationTime: Constants.installationTime,
      nativeAppVersion: Constants.nativeAppVersion,
      nativeBuildVersion: Constants.nativeBuildVersion,
    });
  }, [insets.top]);

  const scrollToSlide = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveSlide(roundIndex);
  };

  useEffect(() => {
    // Start auto-scrolling
    autoScrollTimer.current = setInterval(() => {
      const nextSlide = (activeSlide + 1) % carouselData.length;
      scrollToSlide(nextSlide);
    }, AUTO_SCROLL_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [activeSlide, scrollToSlide]);

  const handleNextPress = () => {
    try {
      crashlytics.logMessage("User pressed Let's start button");
      crashlytics.setCustomKey("action", "pressed_lets_start");
      crashlytics.setCustomKey("active_slide", activeSlide.toString());

      // Log current state
      console.log("Navigation state before onNext:", {
        activeSlide,
        screenWidth,
        screenHeight,
        insets: insets,
        timestamp: new Date().toISOString(),
      });

      onNext?.();
    } catch (error) {
      crashlytics.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          screen: "onboarding_index",
          action: "pressed_lets_start",
          activeSlide,
          error_type: "navigation_error",
        }
      );
      console.error("Error in handleNextPress:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Green Hero Section */}
      <View style={styles.heroContainer} accessibilityLabel="hero-section">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          snapToInterval={screenWidth}
        >
          {carouselData.map((slide, index) => (
            <View key={index} style={styles.slideHero}>
              <View style={styles.imageContainerHero}>
                <Image
                  source={slide.image}
                  style={[
                    styles.screenshot,
                    { height: screenHeight * 0.5 }, // limit image height to 50% of viewport
                  ]}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Black Bottom Panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.headline}>Predict your height</Text>
        <Text style={styles.subtitleText}>
          Input your details to discover your future height and potential
        </Text>

        <View style={styles.paginationBottom}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleNextPress}>
          <Text style={styles.startButtonText}>Let's start</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://docs.google.com/document/d/16ZWdn9p2huxdIsVV51foFDPxCxMSuXofLxgY0A-BvTE/edit?usp=sharing"
              )
            }
          >
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://docs.google.com/document/d/1rg1W0ZepiwV48UTvXhDkiysV1bEg7u8TofQrQAJl1-Q/edit?usp=sharing"
              )
            }
          >
            <Text style={styles.privacyText}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#9ACD32",
    alignItems: "center",
  },
  carousel: {
    width: screenWidth,
  },
  carouselContent: {
    alignItems: "center",
  },
  slideHero: {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainerHero: {
    flex: 1,
    marginTop: 0,
    marginBottom: 40, // spacing below the screenshot only
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  screenshot: {
    width: "100%", // base image width; height supplied inline when rendered
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: screenWidth * 0.85,
    marginBottom: 32,
  },
  bottomPanel: {
    backgroundColor: "#000",
    alignSelf: "stretch",
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
  },
  headline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitleText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  paginationBottom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(154, 205, 50, 0.3)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#9ACD32",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  startButton: {
    backgroundColor: "#9ACD32",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  startButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  privacyLink: {},
  privacyText: {
    color: "#9ACD32",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default withOnboarding(WelcomeScreen, 0, "index");

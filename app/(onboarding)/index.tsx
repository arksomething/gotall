import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import {
  OnboardingScreenProps,
  withOnboarding,
} from "../../components/withOnboarding";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 3000; // Time between auto-scrolls in milliseconds

const carouselData = [
  {
    image: require("../../assets/images/onboarding/home.png"),
    text: "Track your current height and see your projected growth potential with our advanced prediction model.",
    aspectRatio: 0.5,
  },
  {
    image: require("../../assets/images/onboarding/goals.png"),
    text: "Set and track daily goals including sleep, nutrition, and stretching exercises to optimize your growth.",
    aspectRatio: 0.5,
  },
  {
    image: require("../../assets/images/onboarding/exercises.png"),
    text: "Follow guided stretching routines and exercises designed specifically for height optimization.",
    aspectRatio: 0.5,
  },
  {
    image: require("../../assets/images/onboarding/reminders.png"),
    text: "Set posture reminders to maintain good form throughout the day and build better habits.",
    aspectRatio: 0.5,
  },
];

function WelcomeScreen({ onNext }: OnboardingScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <OnboardingLayout
      title="Welcome to GoTall"
      currentStep={0}
      onNext={onNext}
      showBackButton={false}
    >
      <View style={styles.stepContent}>
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
            <View key={index} style={styles.slide}>
              <Text style={styles.welcomeText}>{slide.text}</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={slide.image}
                  style={styles.screenshot}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
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

        <TouchableOpacity
          style={styles.privacyLink}
          onPress={() =>
            Linking.openURL(
              "https://docs.google.com/document/d/16ZWdn9p2huxdIsVV51foFDPxCxMSuXofLxgY0A-BvTE/edit?usp=sharing"
            )
          }
        >
          <Text style={styles.privacyText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  carousel: {
    flex: 1,
    width: screenWidth,
  },
  carouselContent: {
    alignItems: "center",
  },
  slide: {
    width: screenWidth,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: screenWidth * 0.85,
    marginBottom: 32,
  },
  imageContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#9ACD32",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(154, 205, 50, 0.3)",
  },
  screenshot: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
  privacyLink: {
    marginBottom: 20,
  },
  privacyText: {
    color: "#9ACD32",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default withOnboarding(WelcomeScreen, 0, "index");

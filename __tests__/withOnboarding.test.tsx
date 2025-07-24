import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Pressable } from "react-native";
import * as OnboardingContext from "../app/(onboarding)/_layout";

import { withOnboarding } from "../components/withOnboarding";
// Mock Firebase-related native modules **before** importing HOC
jest.mock("@react-native-firebase/app", () => () => ({}));
jest.mock("@react-native-firebase/analytics", () => () => ({
  logEvent: jest.fn(),
  setUserId: jest.fn(),
}));
jest.mock("../utils/FirebaseAnalytics", () => ({
  logScreenView: jest.fn(),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
}));

// Router mocks (names prefixed with "mock" so Jest allows access in factory)
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("../utils/UserContext", () => ({
  useUserData: () => ({ updateUserData: jest.fn() }),
}));

// Default stub for useOnboarding
const baseOnboardingState = {
  setCurrentStep: jest.fn(),
  dateOfBirth: new Date(2010, 0, 1),
  sex: "1",
  height: "5 ft 5 in",
  weight: "120 lb",
  motherHeight: "5 ft 3 in",
  fatherHeight: "5 ft 7 in",
  ethnicity: "Asian",
  preferredHeightUnit: "ft",
  preferredWeightUnit: "lbs",
  usShoeSize: "9",
  euShoeSize: "42",
  dreamHeightCm: 180,
  motherHeightCm: 160,
  fatherHeightCm: 170,
};

jest.mock("../app/(onboarding)/_layout", () => {
  // Build the default state each time the mock is evaluated
  const mockState = {
    setCurrentStep: jest.fn(),
    dateOfBirth: new Date(2010, 0, 1),
    sex: "1",
    height: "5 ft 5 in",
    weight: "120 lb",
    motherHeight: "5 ft 3 in",
    fatherHeight: "5 ft 7 in",
    ethnicity: "Asian",
    preferredHeightUnit: "ft",
    preferredWeightUnit: "lbs",
    usShoeSize: "9",
    euShoeSize: "42",
    dreamHeightCm: 180,
    motherHeightCm: 160,
    fatherHeightCm: 170,
  };
  return { useOnboarding: () => mockState };
});

// Dummy component to wrap
const Dummy = ({ onNext, onBack }: any) => (
  <>
    <Pressable testID="next" onPress={onNext} />
    <Pressable testID="back" onPress={onBack} />
  </>
);

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
});

describe("withOnboarding navigation", () => {
  it("pushes to birthdate from index", () => {
    const Wrapped = withOnboarding(Dummy as any, 0, "index");
    const { getByTestId } = render(<Wrapped />);
    fireEvent.press(getByTestId("next"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/birthdate");
  });

  it("replaces to root when back from birthdate", () => {
    const Wrapped = withOnboarding(Dummy as any, 1, "birthdate");
    const { getByTestId } = render(<Wrapped />);
    fireEvent.press(getByTestId("back"));
    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)");
  });

  it("prevents navigation on parents with invalid heights", () => {
    jest.spyOn(OnboardingContext, "useOnboarding").mockReturnValueOnce({
      ...baseOnboardingState,
      motherHeight: "abc",
      fatherHeight: "xyz",
    } as any);

    const Wrapped = withOnboarding(Dummy as any, 5, "parents");
    const { getByTestId } = render(<Wrapped />);
    fireEvent.press(getByTestId("next"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/shoe");
  });
});

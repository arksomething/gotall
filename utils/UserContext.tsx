import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { convert } from "./heightUtils";

export interface UserData {
  heightCm: number;
  dateOfBirth: string;
  sex: "1" | "2";
  attribution?: string;
  weight: number;
  motherHeightCm: number;
  fatherHeightCm: number;
  ethnicity: string;
  preferredWeightUnit: "lbs" | "kg";
  preferredHeightUnit: "ft" | "cm";
  dreamHeightCm?: number;
  // Puberty section (optional fields)
  puberty_underarmHair?: "no" | "yes";
  puberty_facialHair?: "none" | "faint" | "sometimes" | "regular";
  puberty_growthLastYear?: "lt2" | "2to5" | "6to9" | "10plus";
  puberty_shouldersBroadening?: "no" | "starting" | "broader";
  puberty_bodyOdor?: "no" | "little" | "definitely";
  puberty_acneSeverity?: "none" | "few" | "regular" | "severe" | "cleared";
  puberty_muscleDefinition?: "no" | "little" | "clear";
  puberty_voiceDepth?: "nochange" | "somewhat" | "full";
  puberty_stillGrowingSlower?: "no" | "yes";
  puberty_shaveFrequency?: "no" | "sometimes" | "regularly";
}

interface UserContextType {
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  loadUserData: () => Promise<void>;
  getAge: () => number; // Helper function to calculate age from DOB
  getDisplayHeight: () => string; // Helper to get height in preferred unit
  getDisplayWeight: () => string; // Helper to get weight in preferred unit
  getDisplayMotherHeight: () => string;
  getDisplayFatherHeight: () => string;
}

const defaultUserData: UserData = {
  heightCm: 170,
  dateOfBirth: "2008-01-01",
  sex: "1",
  attribution: "",
  weight: 150,
  motherHeightCm: 165,
  fatherHeightCm: 178,
  ethnicity: "Caucasian",
  preferredWeightUnit: "lbs",
  preferredHeightUnit: "ft",
  dreamHeightCm: Math.round((5 * 12 + 10) * 2.54), // 5'10" (178cm)
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  // Calculate age from date of birth
  const getAge = (): number => {
    const today = new Date();
    const birthDate = new Date(userData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Convert weight from lbs to kg or vice versa
  const convertWeight = (
    weight: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === "lbs" && toUnit === "kg")
      return Math.round(weight * 0.453592);
    if (fromUnit === "kg" && toUnit === "lbs")
      return Math.round(weight / 0.453592);
    return weight;
  };

  // Convert cm to feet and inches using convert-units
  const cmToFeetInches = (cm: number): string => {
    const totalInches = convert(cm).from("cm").to("in");
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    // Handle the case where rounding makes inches = 12
    if (inches === 12) {
      return `${feet + 1}'0"`;
    }

    return `${feet}'${inches}"`;
  };

  // Get height in preferred display format using convert-units
  const getUserDisplayHeight = (): string => {
    if (userData.preferredHeightUnit === "ft") {
      return cmToFeetInches(userData.heightCm);
    }
    return `${userData.heightCm}cm`;
  };

  // Get weight in preferred display format
  const getDisplayWeight = (): string => {
    return `${userData.weight}${userData.preferredWeightUnit}`;
  };

  // Get mother's height in preferred display format using convert-units
  const getDisplayMotherHeight = (): string => {
    if (userData.preferredHeightUnit === "ft") {
      return cmToFeetInches(userData.motherHeightCm);
    }
    return `${userData.motherHeightCm}cm`;
  };

  // Get father's height in preferred display format using convert-units
  const getDisplayFatherHeight = (): string => {
    if (userData.preferredHeightUnit === "ft") {
      return cmToFeetInches(userData.fatherHeightCm);
    }
    return `${userData.fatherHeightCm}cm`;
  };

  const loadUserData = async () => {
    try {
      const [
        height,
        dateOfBirth,
        sex,
        attribution,
        weight,
        motherHeight,
        fatherHeight,
        ethnicity,
        preferredWeightUnit,
        preferredHeightUnit,
        dreamHeight,
        puberty_underarmHair,
        puberty_facialHair,
        puberty_growthLastYear,
        puberty_shouldersBroadening,
        puberty_bodyOdor,
        puberty_acneSeverity,
        puberty_muscleDefinition,
        puberty_voiceDepth,
        puberty_stillGrowingSlower,
        puberty_shaveFrequency,
      ] = await Promise.all([
        AsyncStorage.getItem("@user_height_cm"),
        AsyncStorage.getItem("@user_date_of_birth"),
        AsyncStorage.getItem("@user_sex"),
        AsyncStorage.getItem("@user_attribution"),
        AsyncStorage.getItem("@user_weight"),
        AsyncStorage.getItem("@user_mother_height_cm"),
        AsyncStorage.getItem("@user_father_height_cm"),
        AsyncStorage.getItem("@user_ethnicity"),
        AsyncStorage.getItem("@user_preferred_weight_unit"),
        AsyncStorage.getItem("@user_preferred_height_unit"),
        AsyncStorage.getItem("@user_dream_height_cm"),
        AsyncStorage.getItem("@user_puberty_underarm_hair"),
        AsyncStorage.getItem("@user_puberty_facial_hair"),
        AsyncStorage.getItem("@user_puberty_growth_last_year"),
        AsyncStorage.getItem("@user_puberty_shoulders_broadening"),
        AsyncStorage.getItem("@user_puberty_body_odor"),
        AsyncStorage.getItem("@user_puberty_acne_severity"),
        AsyncStorage.getItem("@user_puberty_muscle_definition"),
        AsyncStorage.getItem("@user_puberty_voice_depth"),
        AsyncStorage.getItem("@user_puberty_still_growing_slower"),
        AsyncStorage.getItem("@user_puberty_shave_frequency"),
      ]);

      setUserData({
        heightCm: parseFloat(height || "") || defaultUserData.heightCm,
        dateOfBirth: dateOfBirth || defaultUserData.dateOfBirth,
        sex: (sex as "1" | "2") || defaultUserData.sex,
        attribution: attribution || defaultUserData.attribution,
        weight: parseFloat(weight || "") || defaultUserData.weight,
        motherHeightCm:
          parseFloat(motherHeight || "") || defaultUserData.motherHeightCm,
        fatherHeightCm:
          parseFloat(fatherHeight || "") || defaultUserData.fatherHeightCm,
        ethnicity: ethnicity || defaultUserData.ethnicity,
        preferredWeightUnit:
          (preferredWeightUnit as "lbs" | "kg") ||
          defaultUserData.preferredWeightUnit,
        preferredHeightUnit:
          (preferredHeightUnit as "ft" | "cm") ||
          defaultUserData.preferredHeightUnit,
        dreamHeightCm: dreamHeight
          ? parseFloat(dreamHeight)
          : defaultUserData.dreamHeightCm,
        // Puberty fields (only include if present)
        ...(puberty_underarmHair
          ? { puberty_underarmHair: puberty_underarmHair as any }
          : {}),
        ...(puberty_facialHair
          ? { puberty_facialHair: puberty_facialHair as any }
          : {}),
        ...(puberty_growthLastYear
          ? { puberty_growthLastYear: puberty_growthLastYear as any }
          : {}),
        ...(puberty_shouldersBroadening
          ? { puberty_shouldersBroadening: puberty_shouldersBroadening as any }
          : {}),
        ...(puberty_bodyOdor
          ? { puberty_bodyOdor: puberty_bodyOdor as any }
          : {}),
        ...(puberty_acneSeverity
          ? { puberty_acneSeverity: puberty_acneSeverity as any }
          : {}),
        ...(puberty_muscleDefinition
          ? { puberty_muscleDefinition: puberty_muscleDefinition as any }
          : {}),
        ...(puberty_voiceDepth
          ? { puberty_voiceDepth: puberty_voiceDepth as any }
          : {}),
        ...(puberty_stillGrowingSlower
          ? { puberty_stillGrowingSlower: puberty_stillGrowingSlower as any }
          : {}),
        ...(puberty_shaveFrequency
          ? { puberty_shaveFrequency: puberty_shaveFrequency as any }
          : {}),
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      const promises: Promise<void>[] = [];

      if (updates.heightCm !== undefined) {
        promises.push(
          AsyncStorage.setItem("@user_height_cm", updates.heightCm.toString())
        );
        // Track last height update time for gating updates in UI
        promises.push(
          AsyncStorage.setItem("@last_height_update_ms", Date.now().toString())
        );
      }

      if (updates.dateOfBirth !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_date_of_birth", updates.dateOfBirth)
        );

      if (updates.sex !== undefined)
        promises.push(AsyncStorage.setItem("@user_sex", updates.sex));

      if (updates.attribution !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_attribution", updates.attribution)
        );

      if (updates.weight !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_weight", updates.weight.toString())
        );

      if (updates.motherHeightCm !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_mother_height_cm",
            updates.motherHeightCm.toString()
          )
        );

      if (updates.fatherHeightCm !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_father_height_cm",
            updates.fatherHeightCm.toString()
          )
        );

      if (updates.ethnicity !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_ethnicity", updates.ethnicity)
        );

      if (updates.preferredWeightUnit !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_preferred_weight_unit",
            updates.preferredWeightUnit
          )
        );

      if (updates.preferredHeightUnit !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_preferred_height_unit",
            updates.preferredHeightUnit
          )
        );

      if (updates.dreamHeightCm !== undefined && updates.dreamHeightCm !== null)
        promises.push(
          AsyncStorage.setItem(
            "@user_dream_height_cm",
            updates.dreamHeightCm.toString()
          )
        );

      // Puberty fields
      if (updates.puberty_underarmHair !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_underarm_hair",
            updates.puberty_underarmHair
          )
        );
      if (updates.puberty_facialHair !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_facial_hair",
            updates.puberty_facialHair
          )
        );
      if (updates.puberty_growthLastYear !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_growth_last_year",
            updates.puberty_growthLastYear
          )
        );
      if (updates.puberty_shouldersBroadening !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_shoulders_broadening",
            updates.puberty_shouldersBroadening
          )
        );
      if (updates.puberty_bodyOdor !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_body_odor",
            updates.puberty_bodyOdor
          )
        );
      if (updates.puberty_acneSeverity !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_acne_severity",
            updates.puberty_acneSeverity
          )
        );
      if (updates.puberty_muscleDefinition !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_muscle_definition",
            updates.puberty_muscleDefinition
          )
        );
      if (updates.puberty_voiceDepth !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_voice_depth",
            updates.puberty_voiceDepth
          )
        );
      if (updates.puberty_stillGrowingSlower !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_still_growing_slower",
            updates.puberty_stillGrowingSlower
          )
        );
      if (updates.puberty_shaveFrequency !== undefined)
        promises.push(
          AsyncStorage.setItem(
            "@user_puberty_shave_frequency",
            updates.puberty_shaveFrequency
          )
        );

      await Promise.all(promises);

      setUserData((prev) => ({
        ...prev,
        ...updates,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        updateUserData,
        loadUserData,
        getAge,
        getDisplayHeight: getUserDisplayHeight,
        getDisplayWeight,
        getDisplayMotherHeight,
        getDisplayFatherHeight,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
};

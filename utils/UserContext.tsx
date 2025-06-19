import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { convert } from "./heightUtils";

export interface UserData {
  heightCm: number;
  dateOfBirth: string;
  sex: "1" | "2";
  weight: number;
  motherHeightCm: number;
  fatherHeightCm: number;
  ethnicity: string;
  preferredWeightUnit: "lbs" | "kg";
  preferredHeightUnit: "ft" | "cm";
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
  dateOfBirth: "2004-01-01",
  sex: "1",
  weight: 68,
  motherHeightCm: 165,
  fatherHeightCm: 178,
  ethnicity: "caucasian",
  preferredWeightUnit: "lbs",
  preferredHeightUnit: "ft",
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
        weight,
        motherHeight,
        fatherHeight,
        ethnicity,
        preferredWeightUnit,
        preferredHeightUnit,
      ] = await Promise.all([
        AsyncStorage.getItem("@user_height_cm"),
        AsyncStorage.getItem("@user_date_of_birth"),
        AsyncStorage.getItem("@user_sex"),
        AsyncStorage.getItem("@user_weight"),
        AsyncStorage.getItem("@user_mother_height_cm"),
        AsyncStorage.getItem("@user_father_height_cm"),
        AsyncStorage.getItem("@user_ethnicity"),
        AsyncStorage.getItem("@user_preferred_weight_unit"),
        AsyncStorage.getItem("@user_preferred_height_unit"),
      ]);

      setUserData({
        heightCm: parseFloat(height || "") || defaultUserData.heightCm,
        dateOfBirth: dateOfBirth || defaultUserData.dateOfBirth,
        sex: (sex as "1" | "2") || defaultUserData.sex,
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
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      const promises: Promise<void>[] = [];

      if (updates.heightCm !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_height_cm", updates.heightCm.toString())
        );

      if (updates.dateOfBirth !== undefined)
        promises.push(
          AsyncStorage.setItem("@user_date_of_birth", updates.dateOfBirth)
        );

      if (updates.sex !== undefined)
        promises.push(AsyncStorage.setItem("@user_sex", updates.sex));

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

import { useUserData } from "./UserContext";
import { formatGain, formatHeight, formatWeight } from "./units";

export const useUnits = () => {
  const { userData } = useUserData();

  return {
    preferredHeightUnit: userData.preferredHeightUnit,
    preferredWeightUnit: userData.preferredWeightUnit,
    height: (cm: number) => formatHeight(cm, userData.preferredHeightUnit),
    weight: (value: number) => formatWeight(value, userData.preferredWeightUnit),
    gain: (inches: number) => formatGain(inches, userData.preferredHeightUnit),
  };
}; 
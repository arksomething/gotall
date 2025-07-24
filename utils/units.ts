import { getHeightForInput } from "./heightUtils";

export type HeightUnit = "ft" | "cm";
export type WeightUnit = "lbs" | "kg";

/**
 * Convert a centimetre value to a formatted height string in the
 * requested unit. Adds the unit suffix for metric.
 */
export const formatHeight = (cm: number, pref: HeightUnit): string => {
  if (pref === "cm") {
    return `${cm} cm`;
  }
  // Re-use existing helper that already formats feet/inches.
  return getHeightForInput(cm, "ft");
};

/**
 * Attach a unit suffix to the provided weight. The actual numeric
 * conversion (lbs ↔ kg) should be done by the caller.
 */
export const formatWeight = (weight: number, pref: WeightUnit): string => {
  return pref === "kg" ? `${weight} kg` : `${weight} lbs`;
};

/**
 * Format a growth amount (provided in inches) based on the preferred unit.
 * Keeps one decimal for metric representation so that +1.3in → +3.3 cm.
 */
export const formatGain = (inches: number, pref: HeightUnit): string => {
  if (pref === "cm") {
    const cm = inches * 2.54;
    return `+${cm.toFixed(1)} cm`;
  }
  return `+${inches} inches`;
};

import { convert } from "./heightUtils";

export interface DreamHeightData {
  dreamHeightCm: number;
  currentHeightCm: number;
  age: number;
  sex: "1" | "2";
  motherHeightCm?: number;
  fatherHeightCm?: number;
}

export interface ProbabilityResult {
  probability: number;
  probabilityText: string;
  dreamHeightFormatted: string;
  heightDifference: number;
  heightDifferenceFormatted: string;
}

export function calculateDreamHeightProbability(data: DreamHeightData): ProbabilityResult {
  const { dreamHeightCm, currentHeightCm, age, sex, motherHeightCm, fatherHeightCm } = data;
  
  // Calculate height difference
  const heightDifference = dreamHeightCm - currentHeightCm;
  const heightDifferenceFormatted = formatHeightDifference(heightDifference);
  
  // Format dream height for display
  const dreamHeightFormatted = formatHeight(dreamHeightCm);
  
  // Calculate probability based on various factors
  let probability = calculateBaseProbability({
    heightDifference,
    age,
    sex,
    motherHeightCm,
    fatherHeightCm,
    dreamHeightCm,
  });
  
  // Ensure probability is within 5-100% range
  probability = Math.max(5, Math.min(100, probability));
  
  const probabilityText = formatProbabilityText(probability);
  
  return {
    probability,
    probabilityText,
    dreamHeightFormatted,
    heightDifference,
    heightDifferenceFormatted
  };
}

interface BaseProbabilityArgs {
  heightDifference: number;
  age: number;
  sex: "1" | "2";
  motherHeightCm?: number;
  fatherHeightCm?: number;
  dreamHeightCm: number;
}

function calculateBaseProbability({
  heightDifference,
  age,
  sex,
  motherHeightCm,
  fatherHeightCm,
  dreamHeightCm,
}: BaseProbabilityArgs): number {
  // If dream height already achieved, certainty is 100%
  if (heightDifference <= 0) {
    return 100;
  }

  // Estimate remaining natural growth potential in cm
  const remainingPotentialCm = getRemainingGrowthPotentialCm(age, sex);

  // If virtually no growth left
  if (remainingPotentialCm < 0.5) {
    return 5;
  }

  // If dream height requires more than 125% of expected potential -> very low chance
  if (heightDifference > remainingPotentialCm * 1.25) {
    return 5;
  }

  // Probability inversely related to how much of remaining growth is needed
  const ratio = heightDifference / remainingPotentialCm; // 0..1.25
  let probability = 95 - ratio * 90; // linear drop from 95 → 5

  // Adjust for genetics if we have parental heights
  if (motherHeightCm && fatherHeightCm) {
    const midparentalHeight =
      sex === "1"
        ? (fatherHeightCm + motherHeightCm + 13) / 2
        : (fatherHeightCm + motherHeightCm - 13) / 2;

    const geneticGap = dreamHeightCm - midparentalHeight;

    // If dream height within 2 cm of mid-parental, small boost
    if (geneticGap <= 2) probability += 5;

    // If dream height > mid-parental by >10 cm, penalise
    if (geneticGap > 10) probability -= 15;
  }

  // Small sex-related tweak (boys have slightly longer growth window)
  if (sex === "1") probability += 3;

  return probability;
}

function getRemainingGrowthPotentialCm(age: number, sex: "1" | "2"): number {
  // Approximate average remaining growth based on CDC growth curves (very rough)
  const tableMale: { age: number; cm: number }[] = [
    { age: 6, cm: 35 },
    { age: 8, cm: 30 },
    { age: 10, cm: 25 },
    { age: 12, cm: 22 },
    { age: 14, cm: 15 },
    { age: 15, cm: 12 },
    { age: 16, cm: 8 },
    { age: 17, cm: 5 },
    { age: 18, cm: 2 },
    { age: 19, cm: 0.5 },
  ];

  const tableFemale: { age: number; cm: number }[] = [
    { age: 6, cm: 30 },
    { age: 8, cm: 25 },
    { age: 10, cm: 20 },
    { age: 11, cm: 17 },
    { age: 12, cm: 13 },
    { age: 13, cm: 9 },
    { age: 14, cm: 6 },
    { age: 15, cm: 3 },
    { age: 16, cm: 1 },
    { age: 17, cm: 0.3 },
  ];

  const table = sex === "1" ? tableMale : tableFemale;

  // Find the first entry older than the user and interpolate linearly
  for (let i = 0; i < table.length - 1; i++) {
    const current = table[i];
    const next = table[i + 1];
    if (age >= current.age && age < next.age) {
      const t = (age - current.age) / (next.age - current.age);
      return current.cm + (next.cm - current.cm) * t;
    }
  }

  // If age younger than first entry, use first value; if older than last, use last
  if (age < table[0].age) return table[0].cm;
  return table[table.length - 1].cm;
}

function formatHeight(heightCm: number): string {
  const totalInches = convert(heightCm).from("cm").to("in");
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  if (inches === 12) {
    return `${feet + 1}'0"`;
  }
  
  return `${feet}'${inches}"`;
}

function formatHeightDifference(differenceCm: number): string {
  if (differenceCm <= 0) {
    return "Already achieved";
  }
  
  const totalInches = convert(differenceCm).from("cm").to("in");
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  if (feet === 0) {
    return `${inches}" to go`;
  }
  
  if (inches === 0) {
    return `${feet}' to go`;
  }
  
  return `${feet}'${inches}" to go`;
}

function formatProbabilityText(probability: number): string {
  if (probability >= 90) {
    return "Very High";
  } else if (probability >= 75) {
    return "High";
  } else if (probability >= 50) {
    return "Moderate";
  } else if (probability >= 25) {
    return "Low";
  } else {
    return "Very Low";
  }
} 
import cdcData from './data.json';
import { HeightConverter } from './heightUtils';

interface UserData {
  heightCm: number;
  age: number;
  sex: "1" | "2";
  motherHeightCm?: number;
  fatherHeightCm?: number;
}

interface HeightData {
  currentHeight: string;
  actualHeight: string;
  potentialHeight: string;
}

interface CDCDataPoint {
  Sex: string;
  Agemos: string;
  L: string;
  M: string;
  S: string;
  P3: string;
  P5: string;
  P10: string;
  P25: string;
  P50: string;
  P75: string;
  P90: string;
  P95: string;
  P97: string;
}

interface HeightDataPoint {
  Sex: string;
  Agemos: string;
  L: string;
  M: string;
  S: string;
  P3: string;
  P5: string;
  P10: string;
  P25: string;
  P50: string;
  P75: string;
  P90: string;
  P95: string;
  P97: string;
}

type PercentileKey = 'P3' | 'P5' | 'P10' | 'P25' | 'P50' | 'P75' | 'P90' | 'P95' | 'P97';
const PERCENTILES = [3, 5, 10, 25, 50, 75, 90, 95, 97];

interface PercentileResult {
  exactPercentile?: number;
  lowerPercentile?: number;
  upperPercentile?: number;
  heightDiffFromLower?: number;
  heightDiffFromUpper?: number;
}

/**
 * Convert age in years to months
 */
function yearsToMonths(years: number): number {
  return Math.round(years * 12);
}

/**
 * Convert months to years (for display)
 */
function monthsToYears(months: number): number {
  return Math.round(months / 12 * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert string number to float
 */
function parseNumber(value: string): number {
  return parseFloat(value);
}

/**
 * Find the surrounding percentiles for a given height at a specific age
 */
export function findSurroundingPercentiles(heightCm: number, ageYears: number, sex: '1' | '2'): PercentileResult {
  const data = cdcData.filter(d => d.Sex === sex);
  if (data.length === 0) {
    throw new Error(`No data found for sex ${sex}. Available data: ${JSON.stringify(cdcData.map(d => d.Sex))}`);
  }

  const ageMonths = yearsToMonths(ageYears);
  
  // Find the data point for the current age
  const dataPoint = data.find(d => parseInt(d.Agemos) === ageMonths);
  if (!dataPoint) {
    throw new Error(`No data found for age ${ageYears} years (${ageMonths} months). Available ages: ${data.map(d => parseInt(d.Agemos)).join(', ')}`);
  }

  // Get all percentile heights for comparison
  const percentileHeights = PERCENTILES.map(p => ({
    percentile: p,
    height: parseNumber(dataPoint[`P${p}` as PercentileKey])
  }));

  // Check if height exactly matches a percentile
  const exactMatch = percentileHeights.find(p => Math.abs(p.height - heightCm) < 0.01);
  if (exactMatch) {
    return { exactPercentile: exactMatch.percentile };
  }

  // Find surrounding percentiles
  let lowerPercentile: number | undefined;
  let upperPercentile: number | undefined;
  let heightDiffFromLower: number | undefined;
  let heightDiffFromUpper: number | undefined;

  for (let i = 0; i < percentileHeights.length; i++) {
    if (percentileHeights[i].height > heightCm) {
      if (i > 0) {
        lowerPercentile = percentileHeights[i - 1].percentile;
        upperPercentile = percentileHeights[i].percentile;
        heightDiffFromLower = heightCm - percentileHeights[i - 1].height;
        heightDiffFromUpper = percentileHeights[i].height - heightCm;
      }
      break;
    }
  }

  // Handle case where height is above highest percentile
  if (!upperPercentile && heightCm > percentileHeights[percentileHeights.length - 1].height) {
    lowerPercentile = percentileHeights[percentileHeights.length - 1].percentile;
    heightDiffFromLower = heightCm - percentileHeights[percentileHeights.length - 1].height;
  }

  // Handle case where height is below lowest percentile
  if (!lowerPercentile && heightCm < percentileHeights[0].height) {
    upperPercentile = percentileHeights[0].percentile;
    heightDiffFromUpper = percentileHeights[0].height - heightCm;
  }

  return {
    lowerPercentile,
    upperPercentile,
    heightDiffFromLower,
    heightDiffFromUpper
  };
}

/**
 * Get projected adult height based on current height percentile(s)
 */
export function getProjectedHeights(heightCm: number, ageYears: number, sex: '1' | '2'): { lower?: number; exact?: number; upper?: number } {
  const data = cdcData.filter(d => d.Sex === sex);
  if (data.length === 0) {
    throw new Error(`No data found for sex ${sex}. Available data: ${JSON.stringify(cdcData.map(d => d.Sex))}`);
  }
  
  // Find current percentile(s)
  const percentiles = findSurroundingPercentiles(heightCm, ageYears, sex);
  
  // Get adult height at max age in data (typically 20 years)
  const maxAgeMonths = Math.max(...data.map(d => parseInt(d.Agemos)));
  const maxAgeYears = monthsToYears(maxAgeMonths);
  
  const adultData = data.find(d => parseInt(d.Agemos) === maxAgeMonths);
  if (!adultData) {
    throw new Error(`Adult height data not found. Available ages: ${data.map(d => parseInt(d.Agemos)).join(', ')}`);
  }

  const result: { lower?: number; exact?: number; upper?: number } = {};

  // If we found an exact percentile match
  if (percentiles.exactPercentile !== undefined) {
    const projectedHeightCm = parseNumber(adultData[`P${percentiles.exactPercentile}` as PercentileKey]);
    result.exact = projectedHeightCm;
  } else {
    if (percentiles.lowerPercentile !== undefined) {
      const lowerProjectedCm = parseNumber(adultData[`P${percentiles.lowerPercentile}` as PercentileKey]);
      result.lower = lowerProjectedCm;
    }
    if (percentiles.upperPercentile !== undefined) {
      const upperProjectedCm = parseNumber(adultData[`P${percentiles.upperPercentile}` as PercentileKey]);
      result.upper = upperProjectedCm;
    }
  }

  return result;
}

export function calculateHeightProjection(userData: UserData): HeightData {
  // Convert current height to inches (no rounding)
  const currentHeightInches = HeightConverter.cmToInches(userData.heightCm);

  // For adults (21+), limit growth potential to 1 inch max
  if (userData.age >= 21) {
    const potentialHeightInches = currentHeightInches + 1;
    
    return {
      currentHeight: HeightConverter.inchesToFeetInches(currentHeightInches),
      actualHeight: HeightConverter.inchesToFeetInches(currentHeightInches),
      potentialHeight: HeightConverter.inchesToFeetInches(potentialHeightInches),
    };
  }

  // Calculate genetic potential (midparental height) first
  let parentBasedHeightInches: number | undefined;
  if (userData.motherHeightCm && userData.fatherHeightCm) {
    // Midparental height formula
    const targetHeightCm =
      userData.sex === "1"
        ? (userData.fatherHeightCm + userData.motherHeightCm + 13) / 2 // For boys: (father + mother + 13) / 2
        : (userData.fatherHeightCm + userData.motherHeightCm - 13) / 2; // For girls: (father + mother - 13) / 2

    const targetHeightInches = HeightConverter.cmToInches(targetHeightCm);
    // Ensure projected height is not shorter than current height
    parentBasedHeightInches = Math.max(targetHeightInches, currentHeightInches);
  }

  let cdcHeightInches: number | undefined;
  // Try to get CDC projections
  try {
    const cdcProjections = getProjectedHeights(
      userData.heightCm,
      userData.age,
      userData.sex
    );

    // If CDC projection is available, use it
    if (cdcProjections.exact !== undefined) {
      const cdcHeightCm = cdcProjections.exact;
      // Ensure CDC projection is not shorter than current height
      if (cdcHeightCm >= userData.heightCm) {
        cdcHeightInches = HeightConverter.cmToInches(cdcHeightCm);
      }
    } else if (cdcProjections.lower !== undefined || cdcProjections.upper !== undefined) {
      // Use the higher value to ensure it's not shorter than current height
      const cdcHeightCm = cdcProjections.upper || cdcProjections.lower || 0;
      if (cdcHeightCm >= userData.heightCm) {
        cdcHeightInches = HeightConverter.cmToInches(cdcHeightCm);
      }
    }
  } catch (cdcError) {
    console.error("CDC projection failed:", cdcError instanceof Error ? cdcError.message : cdcError);
  }

  // For actual and potential height, use CDC as the maximum
  let baseHeightInches = currentHeightInches;
  if (cdcHeightInches !== undefined) {
    baseHeightInches = cdcHeightInches;
  } else if (parentBasedHeightInches !== undefined) {
    baseHeightInches = parentBasedHeightInches;
  }
  
  // Final safety check: ensure base height is never less than current height
  if (baseHeightInches < currentHeightInches) {
    baseHeightInches = currentHeightInches;
  }

  // Calculate potential height first (base height + 1 inch, but cap at reasonable growth)
  const maxReasonableGrowth = userData.age < 18 ? 3 : 1; // 3 inches for teens, 1 inch for adults
  const potentialHeightInches = Math.max(
    Math.min(baseHeightInches + 1, currentHeightInches + maxReasonableGrowth),
    currentHeightInches
  );

  // Calculate actual height (1 inch less than potential, but never less than current)
  const actualHeightInches = Math.max(potentialHeightInches - 1, currentHeightInches);

  // Validate that all projections make logical sense
  if (actualHeightInches < currentHeightInches || potentialHeightInches < currentHeightInches || potentialHeightInches < actualHeightInches) {
    console.error("Height projection logic error detected");
  }

  return {
    currentHeight: HeightConverter.inchesToFeetInches(currentHeightInches),
    actualHeight: HeightConverter.inchesToFeetInches(actualHeightInches),
    potentialHeight: HeightConverter.inchesToFeetInches(potentialHeightInches),
  };
}

export function compareHeights(height1: string, height2: string): string {
  const [feet1, inches1] = height1.split("'").map((v) => parseFloat(v));
  const [feet2, inches2] = height2.split("'").map((v) => parseFloat(v));

  const totalInches1 = feet1 * 12 + inches1;
  const totalInches2 = feet2 * 12 + inches2;

  return totalInches1 >= totalInches2 ? height1 : height2;
}

export function calculatePercentile(sex: string, age: number, currentHeight: number) {
  // Find the closest age data point
  const closestDataPoint = (cdcData as HeightDataPoint[])
    .filter((item) => item.Sex === sex)
    .reduce((prev, curr) => {
      const prevDiff = Math.abs(parseFloat(prev.Agemos) - age);
      const currDiff = Math.abs(parseFloat(curr.Agemos) - age);
      return currDiff < prevDiff ? curr : prev;
    });

  if (!closestDataPoint) return null;

  const formatPercentile = (p: string) => {
    const num = parseInt(p.substring(1));
    if (num === 3) return "3rd";
    return `${num}th`;
  };

  const percentiles = [
    { name: "P3", value: parseFloat(closestDataPoint.P3), display: "3rd" },
    { name: "P5", value: parseFloat(closestDataPoint.P5), display: "5th" },
    { name: "P10", value: parseFloat(closestDataPoint.P10), display: "10th" },
    { name: "P25", value: parseFloat(closestDataPoint.P25), display: "25th" },
    { name: "P50", value: parseFloat(closestDataPoint.P50), display: "50th" },
    { name: "P75", value: parseFloat(closestDataPoint.P75), display: "75th" },
    { name: "P90", value: parseFloat(closestDataPoint.P90), display: "90th" },
    { name: "P95", value: parseFloat(closestDataPoint.P95), display: "95th" },
    { name: "P97", value: parseFloat(closestDataPoint.P97), display: "97th" },
  ];

  if (currentHeight < percentiles[0].value) {
    return {
      range: "Below 3rd percentile",
      lowerBound: null,
      upperBound: percentiles[0],
      lowerName: "Below",
      upperName: "3rd percentile",
    };
  }
  if (currentHeight > percentiles[8].value) {
    return {
      range: "Above 97th percentile",
      lowerBound: percentiles[8],
      upperBound: null,
      lowerName: "97th percentile",
      upperName: "Above",
    };
  }

  for (let i = 0; i < percentiles.length - 1; i++) {
    if (
      currentHeight >= percentiles[i].value &&
      currentHeight <= percentiles[i + 1].value
    ) {
      return {
        range: `${percentiles[i].display} - ${percentiles[i + 1].display} percentile`,
        lowerBound: percentiles[i],
        upperBound: percentiles[i + 1],
        lowerName: `${percentiles[i].display} percentile`,
        upperName: `${percentiles[i + 1].display} percentile`,
      };
    }
  }

  return {
    range: "50th percentile",
    lowerBound: percentiles[4],
    upperBound: percentiles[4],
    lowerName: "50th percentile",
    upperName: "50th percentile",
  }; // Default to median
} 
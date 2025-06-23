import convert from "convert-units";
import cdcData from './data.json';

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
 * Convert centimeters to feet and inches format
 */
function cmToFeetInches(cm: number): string {
  const inches = convert(cm).from('cm').to('in');
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return remainingInches === 12 ? `${feet + 1}'0"` : `${feet}'${remainingInches}"`;
}

/**
 * Find the surrounding percentiles for a given height at a specific age
 */
function findSurroundingPercentiles(heightCm: number, ageYears: number, sex: '1' | '2'): PercentileResult {
  const data = cdcData.filter(d => d.Sex === sex);
  if (data.length === 0) {
    throw new Error(`No data found for sex ${sex}. Available data: ${JSON.stringify(cdcData.map(d => d.Sex))}`);
  }

  const ageMonths = yearsToMonths(ageYears);
  const minAge = Math.min(...data.map(d => parseInt(d.Agemos)));
  const maxAge = Math.max(...data.map(d => parseInt(d.Agemos)));
  console.log(`Looking for age ${ageYears} years (${ageMonths} months) in data with age range: ${minAge} to ${maxAge} months (${monthsToYears(minAge)} to ${monthsToYears(maxAge)} years)`);
  
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
    console.log(`Found exact match at percentile ${exactMatch.percentile} (height: ${exactMatch.height}cm)`);
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

  console.log(`Height ${heightCm}cm falls between percentiles:`, {
    lower: lowerPercentile ? `${lowerPercentile}th (diff: ${heightDiffFromLower?.toFixed(2)}cm)` : 'none',
    upper: upperPercentile ? `${upperPercentile}th (diff: ${heightDiffFromUpper?.toFixed(2)}cm)` : 'none'
  });

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
export function getProjectedHeights(heightCm: number, ageYears: number, sex: '1' | '2'): { lower?: string; exact?: string; upper?: string } {
  console.log(`\nCalculating CDC projection for: height=${heightCm}cm, age=${ageYears}, sex=${sex}`);
  
  const data = cdcData.filter(d => d.Sex === sex);
  if (data.length === 0) {
    console.log("No CDC data found for sex:", sex);
    throw new Error(`No data found for sex ${sex}. Available data: ${JSON.stringify(cdcData.map(d => d.Sex))}`);
  }
  
  // Find current percentile(s)
  const percentiles = findSurroundingPercentiles(heightCm, ageYears, sex);
  console.log("Found percentiles:", percentiles);
  
  // Get adult height at max age in data (typically 20 years)
  const maxAgeMonths = Math.max(...data.map(d => parseInt(d.Agemos)));
  const maxAgeYears = monthsToYears(maxAgeMonths);
  console.log(`Using max age from CDC data: ${maxAgeYears} years (${maxAgeMonths} months)`);
  
  const adultData = data.find(d => parseInt(d.Agemos) === maxAgeMonths);
  if (!adultData) {
    console.log("Adult height data not found in CDC data");
    throw new Error(`Adult height data not found. Available ages: ${data.map(d => parseInt(d.Agemos)).join(', ')}`);
  }

  const result: { lower?: string; exact?: string; upper?: string } = {};

  // If we found an exact percentile match
  if (percentiles.exactPercentile !== undefined) {
    const projectedHeightCm = parseNumber(adultData[`P${percentiles.exactPercentile}` as PercentileKey]);
    console.log(`Found exact percentile match at P${percentiles.exactPercentile}, projected height: ${projectedHeightCm}cm`);
    result.exact = cmToFeetInches(projectedHeightCm);
  } else {
    if (percentiles.lowerPercentile !== undefined) {
      const lowerProjectedCm = parseNumber(adultData[`P${percentiles.lowerPercentile}` as PercentileKey]);
      console.log(`Lower bound projection: ${lowerProjectedCm}cm at P${percentiles.lowerPercentile}`);
      result.lower = cmToFeetInches(lowerProjectedCm);
    }
    if (percentiles.upperPercentile !== undefined) {
      const upperProjectedCm = parseNumber(adultData[`P${percentiles.upperPercentile}` as PercentileKey]);
      console.log(`Upper bound projection: ${upperProjectedCm}cm at P${percentiles.upperPercentile}`);
      result.upper = cmToFeetInches(upperProjectedCm);
    }
  }

  console.log("Final CDC projections:", result);
  return result;
}

export function calculateHeightProjection(userData: UserData): HeightData {
  // Convert current height to feet/inches
  const currentHeightInches = convert(userData.heightCm).from("cm").to("in");
  const currentFeet = Math.floor(currentHeightInches / 12);
  const currentInches = Math.round(currentHeightInches % 12);
  const currentHeight =
    currentInches === 12
      ? `${currentFeet + 1}'0"`
      : `${currentFeet}'${currentInches}"`;

  // For adults (21+), limit growth potential to 1 inch max
  if (userData.age >= 21) {
    const maxGrowthFeet = Math.floor((currentHeightInches + 1) / 12);
    const maxGrowthInches = Math.round((currentHeightInches + 1) % 12);
    const potentialHeight = maxGrowthInches === 12 
      ? `${maxGrowthFeet + 1}'0"` 
      : `${maxGrowthFeet}'${maxGrowthInches}"`;
    
    return {
      currentHeight,
      actualHeight: currentHeight, // No more genetic potential growth
      potentialHeight,
    };
  }

  // Calculate genetic potential (midparental height) first
  let actualHeight = "";
  let parentBasedHeight = "";
  if (userData.motherHeightCm && userData.fatherHeightCm) {
    // Midparental height formula
    const targetHeightCm =
      userData.sex === "1"
        ? (userData.fatherHeightCm + userData.motherHeightCm + 13) / 2 // For boys: (father + mother + 13) / 2
        : (userData.fatherHeightCm + userData.motherHeightCm - 13) / 2; // For girls: (father + mother - 13) / 2

    const targetHeightInches = convert(targetHeightCm).from("cm").to("in");
    // Ensure projected height is not shorter than current height
    const adjustedTargetInches = Math.max(targetHeightInches, currentHeightInches);
    const targetFeet = Math.floor(adjustedTargetInches / 12);
    const targetInches = Math.round(adjustedTargetInches % 12);
    parentBasedHeight =
      targetInches === 12
        ? `${targetFeet + 1}'0"`
        : `${targetFeet}'${targetInches}"`;
  }

  let cdcHeight = "";
  // Try to get CDC projections
  try {
    console.log("Getting CDC projections for:", {
      heightCm: userData.heightCm,
      age: userData.age,
      sex: userData.sex
    });
    const cdcProjections = getProjectedHeights(
      userData.heightCm,
      userData.age,
      userData.sex
    );

    console.log("CDC projections result:", cdcProjections);
    // If CDC projection is available, use it
    if (cdcProjections.exact) {
      console.log("CDC exact projection available:", cdcProjections.exact);
      cdcHeight = cdcProjections.exact;
    } else if (cdcProjections.lower || cdcProjections.upper) {
      console.log("CDC range projection available:", {
        lower: cdcProjections.lower,
        upper: cdcProjections.upper
      });
      // Use the upper value for a more optimistic projection
      cdcHeight = cdcProjections.upper || cdcProjections.lower || "";
    } else {
      console.log("No CDC projections available");
    }
  } catch (cdcError) {
    console.log(
      "CDC projection failed:",
      cdcError instanceof Error ? cdcError.message : cdcError
    );
  }

  // For actual and potential height, use CDC as the maximum
  let baseHeight = currentHeight;
  let projectionMethod = "current height (no projections available)";
  if (cdcHeight && cdcHeight.length > 0) {
    console.log("Using CDC height:", cdcHeight);
    baseHeight = cdcHeight;
    projectionMethod = "CDC growth charts";
  } else if (parentBasedHeight && parentBasedHeight.length > 0) {
    console.log("CDC height not available, using parent-based height:", parentBasedHeight);
    baseHeight = parentBasedHeight;
    projectionMethod = "parent-based calculation";
  } else {
    console.log("No projections available, using current height:", currentHeight);
  }
  
  console.log("Final projection using:", projectionMethod);
  console.log("Base height for calculations:", baseHeight);

  // Calculate actual height (1 inch less than base)
  const [baseFeet, baseInches] = baseHeight.split("'").map(v => parseInt(v));
  const baseTotalInches = baseFeet * 12 + baseInches;
  const actualTotalInches = Math.max(baseTotalInches - 1, currentHeightInches);
  const actualFeet = Math.floor(actualTotalInches / 12);
  const actualInches = Math.round(actualTotalInches % 12);
  actualHeight = actualInches === 12 
    ? `${actualFeet + 1}'0"` 
    : `${actualFeet}'${actualInches}"`;

  // Calculate potential height (base height + 1 inch)
  const potentialTotalInches = baseTotalInches + 1;
  const potentialFeet = Math.floor(potentialTotalInches / 12);
  const potentialInches = Math.round(potentialTotalInches % 12);
  const potentialHeight = potentialInches === 12 
    ? `${potentialFeet + 1}'0"` 
    : `${potentialFeet}'${potentialInches}"`;

  console.log("Final height projections:", {
    current: currentHeight,
    actual: actualHeight,
    potential: potentialHeight
  });

  return {
    currentHeight,
    actualHeight,
    potentialHeight,
  };
}

export function compareHeights(height1: string, height2: string): string {
  const [feet1, inches1] = height1.split("'").map((v) => parseFloat(v));
  const [feet2, inches2] = height2.split("'").map((v) => parseFloat(v));

  const totalInches1 = feet1 * 12 + inches1;
  const totalInches2 = feet2 * 12 + inches2;

  return totalInches1 >= totalInches2 ? height1 : height2;
} 
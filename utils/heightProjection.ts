import cdcData from './data.json';
import { convert } from './heightUtils';

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
 * Find the surrounding percentiles for a given height at a specific age
 * @param heightCm Height in centimeters
 * @param ageYears Age in years
 * @param sex '1' for male, '2' for female
 * @returns The exact percentile if height matches exactly, or the surrounding percentiles
 */
export function findSurroundingPercentiles(heightCm: number, ageYears: number, sex: '1' | '2'): PercentileResult {
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
 * @param heightCm Current height in centimeters
 * @param ageYears Current age in years
 * @param sex '1' for male, '2' for female
 * @returns Projected adult heights in feet and inches format
 */
export function getProjectedHeights(heightCm: number, ageYears: number, sex: '1' | '2'): { lower?: string; exact?: string; upper?: string } {
  console.log(`Calculating projection for: height=${heightCm}cm, age=${ageYears}, sex=${sex}`);
  
  const data = cdcData.filter(d => d.Sex === sex);
  if (data.length === 0) {
    throw new Error(`No data found for sex ${sex}. Available data: ${JSON.stringify(cdcData.map(d => d.Sex))}`);
  }
  
  // Find current percentile(s)
  const percentiles = findSurroundingPercentiles(heightCm, ageYears, sex);
  
  // Get adult height at max age in data (typically 20 years)
  const maxAgeMonths = Math.max(...data.map(d => parseInt(d.Agemos)));
  const maxAgeYears = monthsToYears(maxAgeMonths);
  console.log(`Using max age from data: ${maxAgeYears} years (${maxAgeMonths} months)`);
  
  const adultData = data.find(d => parseInt(d.Agemos) === maxAgeMonths);
  if (!adultData) {
    throw new Error(`Adult height data not found. Available ages: ${data.map(d => parseInt(d.Agemos)).join(', ')}`);
  }

  const result: { lower?: string; exact?: string; upper?: string } = {};

  // If we found an exact percentile match
  if (percentiles.exactPercentile !== undefined) {
    const projectedHeightCm = parseNumber(adultData[`P${percentiles.exactPercentile}` as PercentileKey]);
    console.log(`Projected adult height: ${projectedHeightCm}cm at exact percentile ${percentiles.exactPercentile}`);
    result.exact = cmToFeetInches(projectedHeightCm);
  } else {
    // Get projections for surrounding percentiles
    if (percentiles.lowerPercentile !== undefined) {
      const lowerProjectedCm = parseNumber(adultData[`P${percentiles.lowerPercentile}` as PercentileKey]);
      console.log(`Lower bound projection: ${lowerProjectedCm}cm at percentile ${percentiles.lowerPercentile}`);
      result.lower = cmToFeetInches(lowerProjectedCm);
    }
    if (percentiles.upperPercentile !== undefined) {
      const upperProjectedCm = parseNumber(adultData[`P${percentiles.upperPercentile}` as PercentileKey]);
      console.log(`Upper bound projection: ${upperProjectedCm}cm at percentile ${percentiles.upperPercentile}`);
      result.upper = cmToFeetInches(upperProjectedCm);
    }
  }

  return result;
}

/**
 * Convert centimeters to feet and inches format
 */
function cmToFeetInches(cm: number): string {
  const totalInches = convert(cm).from('cm').to('in');
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  // Handle case where rounding makes inches = 12
  const result = inches === 12 ? `${feet + 1}'0"` : `${feet}'${inches}"`;
  console.log(`Converted ${cm}cm to ${result}`);
  return result;
} 
import { calculateHeightProjection, findSurroundingPercentiles, getProjectedHeights } from './heightProjection';
import { HeightConverter } from './heightUtils';

// Mock data for testing
const mockCdcData = [
  // 10 year old boy data (120 months)
  {
    Sex: "1",
    Agemos: "120",
    L: "1",
    M: "138.5",
    S: "0.0408",
    P3: "127.5",
    P5: "129.5",
    P10: "132.5",
    P25: "135.5",
    P50: "138.5",
    P75: "141.5",
    P90: "144.5",
    P95: "146.5",
    P97: "147.5"
  },
  // 20 year old boy data (240 months) - adult height
  {
    Sex: "1",
    Agemos: "240",
    L: "1",
    M: "176.5",
    S: "0.0408",
    P3: "165.5",
    P5: "167.5",
    P10: "170.5",
    P25: "173.5",
    P50: "176.5",
    P75: "179.5",
    P90: "182.5",
    P95: "184.5",
    P97: "185.5"
  }
];

// Mock the cdcData import
jest.mock('./data.json', () => mockCdcData);

describe('Height Projection Tests', () => {
  describe('findSurroundingPercentiles', () => {
    it('should find correct percentiles for a 10-year-old boy at 50th percentile', () => {
      const result = findSurroundingPercentiles(138.5, 10, '1');
      expect(result.exactPercentile).toBe(50);
    });

    it('should find surrounding percentiles for a 10-year-old boy between 25th and 50th', () => {
      const result = findSurroundingPercentiles(137.0, 10, '1');
      expect(result.lowerPercentile).toBe(25);
      expect(result.upperPercentile).toBe(50);
    });
  });

  describe('getProjectedHeights', () => {
    it('should project adult height for a 10-year-old boy at 50th percentile', () => {
      const result = getProjectedHeights(138.5, 10, '1');
      expect(result.exact).toBe(176.5); // Should project to 50th percentile adult height
    });

    it('should project adult height for a 10-year-old boy between percentiles', () => {
      const result = getProjectedHeights(137.0, 10, '1');
      expect(result.lower).toBe(173.5); // 25th percentile adult height
      expect(result.upper).toBe(176.5); // 50th percentile adult height
    });
  });

  describe('calculateHeightProjection - Children Under 12', () => {
    it('should provide reasonable projections for a 10-year-old boy', () => {
      const userData = {
        heightCm: 138.5, // 50th percentile for 10-year-old boy
        age: 10,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180
      };

      const result = calculateHeightProjection(userData);
      
      console.log('10-year-old boy projection:', result);
      
      // Convert back to cm for analysis
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const actualCm = HeightConverter.feetInchesToCm(result.actualHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      console.log('Current height (cm):', currentCm);
      console.log('Actual projection (cm):', actualCm);
      console.log('Potential projection (cm):', potentialCm);
      console.log('Growth from current to potential (cm):', potentialCm - currentCm);
      
      // The issue: for a 10-year-old, we should expect much more growth than 3cm
      // A 10-year-old boy should grow about 60-70cm more to reach adult height
      expect(potentialCm - currentCm).toBeGreaterThan(50); // Should grow more than 50cm
    });

    it('should provide reasonable projections for a 8-year-old boy', () => {
      const userData = {
        heightCm: 130.0, // Average 8-year-old boy
        age: 8,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180
      };

      const result = calculateHeightProjection(userData);
      
      console.log('8-year-old boy projection:', result);
      
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      console.log('Growth from current to potential (cm):', potentialCm - currentCm);
      
      // An 8-year-old should grow even more
      expect(potentialCm - currentCm).toBeGreaterThan(60); // Should grow more than 60cm
    });

    it('should provide reasonable projections for a 12-year-old boy', () => {
      const userData = {
        heightCm: 150.0, // Average 12-year-old boy
        age: 12,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180
      };

      const result = calculateHeightProjection(userData);
      
      console.log('12-year-old boy projection:', result);
      
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      console.log('Growth from current to potential (cm):', potentialCm - currentCm);
      
      // A 12-year-old should still grow significantly
      expect(potentialCm - currentCm).toBeGreaterThan(25); // Should grow more than 25cm
    });
  });

  describe('calculateHeightProjection - Adults', () => {
    it('should limit growth for adults', () => {
      const userData = {
        heightCm: 175.0,
        age: 25,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180
      };

      const result = calculateHeightProjection(userData);
      
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      // Adults should have limited growth potential
      expect(potentialCm - currentCm).toBeLessThanOrEqual(3); // Max 3cm for adults
    });
  });

  describe('Edge Cases', () => {
    it('should handle very young children', () => {
      const userData = {
        heightCm: 100.0, // 5-year-old height
        age: 5,
        sex: "1" as const
      };

      const result = calculateHeightProjection(userData);
      
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      console.log('5-year-old projection:', result);
      console.log('Growth from current to potential (cm):', potentialCm - currentCm);
      
      // Very young children should have massive growth potential
      expect(potentialCm - currentCm).toBeGreaterThan(70); // Should grow more than 70cm
    });
  });
});

// Manual test function for debugging
export function debugHeightProjection() {
  console.log('=== Height Projection Debug ===');
  
  const testCases = [
    { age: 5, heightCm: 110, sex: '1' as const, description: '5-year-old boy' },
    { age: 8, heightCm: 130, sex: '1' as const, description: '8-year-old boy' },
    { age: 10, heightCm: 138.5, sex: '1' as const, description: '10-year-old boy' },
    { age: 12, heightCm: 150, sex: '1' as const, description: '12-year-old boy' },
    { age: 15, heightCm: 165, sex: '1' as const, description: '15-year-old boy' },
    { age: 18, heightCm: 175, sex: '1' as const, description: '18-year-old boy' },
    { age: 25, heightCm: 175, sex: '1' as const, description: '25-year-old man' },
  ];

  testCases.forEach(testCase => {
    const userData = {
      heightCm: testCase.heightCm,
      age: testCase.age,
      sex: testCase.sex,
      motherHeightCm: 165,
      fatherHeightCm: 180
    };

    try {
      const result = calculateHeightProjection(userData);
      const currentCm = HeightConverter.feetInchesToCm(result.currentHeight);
      const actualCm = HeightConverter.feetInchesToCm(result.actualHeight);
      const potentialCm = HeightConverter.feetInchesToCm(result.potentialHeight);
      
      console.log(`\n${testCase.description}:`);
      console.log(`  Current: ${result.currentHeight} (${currentCm}cm)`);
      console.log(`  Actual: ${result.actualHeight} (${actualCm}cm)`);
      console.log(`  Potential: ${result.potentialHeight} (${potentialCm}cm)`);
      console.log(`  Growth: ${potentialCm - currentCm}cm`);
      
      if (testCase.age < 18 && (potentialCm - currentCm) < 20) {
        console.log(`  ⚠️  WARNING: Very low growth projection for child!`);
      }
    } catch (error) {
      console.log(`\n${testCase.description}: ERROR - ${error}`);
    }
  });
} 
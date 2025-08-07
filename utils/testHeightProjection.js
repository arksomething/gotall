// Simple test script to verify height projection fix
// Run with: node utils/testHeightProjection.js

const { calculateHeightProjection } = require('./heightProjection');
const { HeightConverter } = require('./heightUtils');

function testHeightProjection() {
  console.log('=== Testing Height Projection Fix ===\n');

  const testCases = [
    { age: 5, heightCm: 110, sex: '1', description: '5-year-old boy' },
    { age: 8, heightCm: 130, sex: '1', description: '8-year-old boy' },
    { age: 10, heightCm: 138.5, sex: '1', description: '10-year-old boy' },
    { age: 12, heightCm: 150, sex: '1', description: '12-year-old boy' },
    { age: 15, heightCm: 165, sex: '1', description: '15-year-old boy' },
    { age: 18, heightCm: 175, sex: '1', description: '18-year-old boy' },
    { age: 25, heightCm: 175, sex: '1', description: '25-year-old man' },
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
      
      console.log(`${testCase.description}:`);
      console.log(`  Current: ${result.currentHeight} (${currentCm.toFixed(1)}cm)`);
      console.log(`  Actual: ${result.actualHeight} (${actualCm.toFixed(1)}cm)`);
      console.log(`  Potential: ${result.potentialHeight} (${potentialCm.toFixed(1)}cm)`);
      console.log(`  Growth: ${(potentialCm - currentCm).toFixed(1)}cm`);
      
      // Check if growth projection is reasonable
      const growthCm = potentialCm - currentCm;
      let status = '✅';
      
      if (testCase.age < 12 && growthCm < 20) {
        status = '❌ TOO LOW';
      } else if (testCase.age >= 18 && growthCm > 5) {
        status = '❌ TOO HIGH';
      } else if (testCase.age < 18 && growthCm < 10) {
        status = '⚠️  LOW';
      }
      
      console.log(`  Status: ${status}\n`);
      
    } catch (error) {
      console.log(`${testCase.description}: ERROR - ${error}\n`);
    }
  });
}

// Run the test
testHeightProjection(); 
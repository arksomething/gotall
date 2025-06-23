interface HealthGoals {
  sleepHours: number;
  calories: number;
}

// Sleep recommendations based on age (source: CDC)
const sleepRecommendations = [
  { minAge: 0, maxAge: 2, hours: 12 },   // Toddlers
  { minAge: 3, maxAge: 5, hours: 11 },   // Preschool
  { minAge: 6, maxAge: 12, hours: 10 },  // School age
  { minAge: 13, maxAge: 18, hours: 9 },  // Teen
  { minAge: 19, maxAge: 100, hours: 8 }, // Adult
];

// Base calorie needs by age and sex (source: Dietary Guidelines for Americans)
const baseCalorieNeeds = [
  { minAge: 2, maxAge: 3, male: 1000, female: 1000 },
  { minAge: 4, maxAge: 8, male: 1400, female: 1200 },
  { minAge: 9, maxAge: 13, male: 1800, female: 1600 },
  { minAge: 14, maxAge: 18, male: 2200, female: 1800 },
  { minAge: 19, maxAge: 30, male: 2400, female: 2000 },
  { minAge: 31, maxAge: 50, male: 2200, female: 1800 },
  { minAge: 51, maxAge: 100, male: 2000, female: 1600 },
];

export function calculateHealthGoals(age: number, sex: "1" | "2"): HealthGoals {
  // Find sleep recommendation
  const sleepRec = sleepRecommendations.find(
    rec => age >= rec.minAge && age <= rec.maxAge
  ) || sleepRecommendations[sleepRecommendations.length - 1];

  // Find calorie recommendation
  const calorieRec = baseCalorieNeeds.find(
    rec => age >= rec.minAge && age <= rec.maxAge
  ) || baseCalorieNeeds[baseCalorieNeeds.length - 1];

  return {
    sleepHours: sleepRec.hours,
    calories: sex === "1" ? calorieRec.male : calorieRec.female,
  };
} 
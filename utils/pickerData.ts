// Imperial height range (3'0" to 8'0")
export const generateImperialHeight = () => {
  const heights = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      const label = `${feet} ft ${inches} in`;
      const value = `${feet} ft ${inches} in`;
      heights.push({ label, value });
    }
  }
  return heights;
};

// Metric height range (100cm to 250cm)
export const generateMetricHeight = () => {
  const heights = [];
  for (let cm = 120; cm <= 220; cm++) {
    const label = `${cm} cm`;
    const value = `${cm} cm`;
    heights.push({ label, value });
  }
  return heights;
};

// Imperial weight range (50 lbs to 600 lbs)
export const generateImperialWeight = () => {
  const weights = [];
  for (let lbs = 80; lbs <= 300; lbs++) {
    const label = `${lbs} lb`;
    const value = `${lbs} lb`;
    weights.push({ label, value });
  }
  return weights;
};

// Metric weight range (20kg to 270kg)
export const generateMetricWeight = () => {
  const weights = [];
  for (let kg = 36; kg <= 136; kg++) {
    const label = `${kg} kg`;
    const value = `${kg} kg`;
    weights.push({ label, value });
  }
  return weights;
}; 
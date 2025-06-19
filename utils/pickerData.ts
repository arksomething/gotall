// Imperial height range (3'0" to 8'0")
export const generateImperialHeight = () => {
  const heights = [];
  // Start at 5'7" and add it first
  heights.push({ label: "5 ft 7 in", value: "5 ft 7 in" });
  
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      // Skip 5'7" since we already added it
      if (feet === 5 && inches === 7) continue;
      const label = `${feet} ft ${inches} in`;
      const value = `${feet} ft ${inches} in`;
      heights.push({ label, value });
    }
  }
  
  // Sort the array so 5'7" is not at the beginning
  heights.sort((a, b) => {
    const [aFeet, aInches] = a.value.match(/\d+/g)!.map(Number);
    const [bFeet, bInches] = b.value.match(/\d+/g)!.map(Number);
    if (aFeet === bFeet) return aInches - bInches;
    return aFeet - bFeet;
  });
  
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
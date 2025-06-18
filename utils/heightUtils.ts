import convert from 'convert-units';

export { convert };

export interface HeightValidationResult {
  isValid: boolean;
  errorMessage?: string;
  heightInCm?: number;
}

// Function to format height for input display
export const getHeightForInput = (heightInCm: number, unit: "ft" | "cm"): string => {
  if (unit === "cm") {
    return heightInCm.toString();
  } else {
    // Convert cm to feet and inches
    const totalInches = convert(heightInCm).from('cm').to('in');
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);

    // Handle the case where rounding makes inches = 12
    if (inches === 12) {
      feet += 1;
      inches = 0;
    }

    return `${feet}'${inches}"`;
  }
};

// Core function to parse height string to cm
export const parseHeightToCm = (heightStr: string, unit: "ft" | "cm"): number => {
  if (unit === "cm") {
    const cm = parseInt(heightStr.trim());
    return isNaN(cm) ? 0 : cm;
  } else {
    // Parse feet and inches format
    const cleanHeight = heightStr
      .trim()
      .toLowerCase()
      // First, normalize all text-based height indicators to symbols
      .replace(/ft|feet/g, "'")
      .replace(/in|inch|inches|"/g, "")
      // Then, ensure consistent spacing around the foot symbol
      .replace(/\s*'\s*/, "'")
      .replace(/\s+/g, " ");

    let feet = 0;
    let inches = 0;

    if (cleanHeight.includes("'")) {
      const parts = cleanHeight.split("'");
      feet = parseInt(parts[0]) || 0;
      if (parts.length > 1) {
        inches = parseInt(parts[1]) || 0;
      }
    } else if (cleanHeight.includes(" ")) {
      const parts = cleanHeight.split(" ");
      feet = parseInt(parts[0]) || 0;
      if (parts.length > 1) {
        inches = parseInt(parts[1]) || 0;
      }
    } else {
      feet = parseInt(cleanHeight) || 0;
    }

    if (feet < 0 || feet > 8 || inches < 0 || inches >= 12) {
      return 0;
    }

    // Use convert-units for conversion
    const totalInches = feet * 12 + inches;
    return Math.round(convert(totalInches).from("in").to("cm"));
  }
};

// Validation function that uses the common parsing logic
export const validateHeightInput = (heightStr: string, unit: "ft" | "cm"): HeightValidationResult => {
  if (!heightStr.trim()) {
    return { isValid: false, errorMessage: "Height is required" };
  }
  
  const heightInCm = parseHeightToCm(heightStr, unit);
  
  if (heightInCm === 0) {
    if (unit === "cm") {
      return { isValid: false, errorMessage: "Please enter a valid number" };
    } else {
      return { isValid: false, errorMessage: "Please enter a valid height (e.g., 5'8 or 5 8)" };
    }
  }
  
  if (unit === "cm") {
    if (heightInCm < 100 || heightInCm > 250) {
      return { isValid: false, errorMessage: "Please enter a height between 100-250 cm" };
    }
  } else {
    // For feet/inches, check reasonable bounds (about 3'0" to 8'0")
    if (heightInCm < 91 || heightInCm > 244) {
      return { isValid: false, errorMessage: "Please enter feet between 3-8" };
    }
  }
  
  return { isValid: true, heightInCm };
};

// Alias for backward compatibility
export const validateHeight = validateHeightInput; 
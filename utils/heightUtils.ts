import convert from 'convert-units';

export { convert };

export interface HeightValidationResult {
  isValid: boolean;
  errorMessage?: string;
  heightInCm?: number;
}

// Single source of truth for height conversions
export class HeightConverter {
  /**
   * Convert centimeters to feet and inches string
   * @param cm - height in centimeters
   * @param roundInches - whether to round inches (default: true)
   * @returns formatted string like "5'8""
   */
  static cmToFeetInches(cm: number, roundInches: boolean = true): string {
    const totalInches = convert(cm).from('cm').to('in');
    const feet = Math.floor(totalInches / 12);
    const remainingInches = roundInches ? Math.round(totalInches % 12) : totalInches % 12;
    
    // Handle edge case where rounding makes inches = 12
    if (roundInches && remainingInches === 12) {
      return `${feet + 1}'0"`;
    }
    
    return `${feet}'${Math.round(remainingInches)}"`;
  }

  /**
   * Convert centimeters to feet and inches without rounding
   * @param cm - height in centimeters
   * @returns formatted string like "5'8.5""
   */
  static cmToFeetInchesExact(cm: number): string {
    return this.cmToFeetInches(cm, false);
  }

  /**
   * Convert feet and inches string to centimeters
   * @param feetInches - height string like "5'8""
   * @returns height in centimeters
   */
  static feetInchesToCm(feetInches: string): number {
    const cleanHeight = feetInches
      .trim()
      .toLowerCase()
      .replace(/ft|feet/g, "'")
      .replace(/in|inch|inches|"/g, "")
      .replace(/\s*'\s*/, "'")
      .replace(/\s+/g, " ");

    let feet = 0;
    let inches = 0;

    if (cleanHeight.includes("'")) {
      const parts = cleanHeight.split("'");
      feet = parseInt(parts[0]) || 0;
      if (parts.length > 1) {
        inches = parseFloat(parts[1]) || 0;
      }
    } else if (cleanHeight.includes(" ")) {
      const parts = cleanHeight.split(" ");
      feet = parseInt(parts[0]) || 0;
      if (parts.length > 1) {
        inches = parseFloat(parts[1]) || 0;
      }
    } else {
      feet = parseInt(cleanHeight) || 0;
    }

    if (feet < 0 || feet > 8 || inches < 0 || inches >= 12) {
      return 0;
    }

    const totalInches = feet * 12 + inches;
    return convert(totalInches).from("in").to("cm");
  }

  /**
   * Convert centimeters to inches
   * @param cm - height in centimeters
   * @returns height in inches
   */
  static cmToInches(cm: number): number {
    return convert(cm).from('cm').to('in');
  }

  /**
   * Convert inches to centimeters
   * @param inches - height in inches
   * @returns height in centimeters
   */
  static inchesToCm(inches: number): number {
    return convert(inches).from('in').to('cm');
  }

  /**
   * Convert inches to feet and inches string
   * @param inches - height in inches
   * @param roundInches - whether to round inches (default: true)
   * @returns formatted string like "5'8""
   */
  static inchesToFeetInches(inches: number, roundInches: boolean = true): string {
    const feet = Math.floor(inches / 12);
    const remainingInches = roundInches ? Math.round(inches % 12) : inches % 12;
    
    // Handle edge case where rounding makes inches = 12
    if (roundInches && remainingInches === 12) {
      return `${feet + 1}'0"`;
    }
    
    return `${feet}'${Math.round(remainingInches)}"`;
  }

  /**
   * Round height to specified decimal places
   * @param cm - height in centimeters
   * @param decimals - number of decimal places (default: 1)
   * @returns rounded height in centimeters
   */
  static roundHeight(cm: number, decimals: number = 1): number {
    return Math.round(cm * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Round height to nearest centimeter
   * @param cm - height in centimeters
   * @returns rounded height in centimeters
   */
  static roundToNearestCm(cm: number): number {
    return Math.round(cm);
  }
}

// Single source of truth for height validation
export class HeightValidator {
  /**
   * Validate height input and convert to centimeters
   * @param heightStr - height string input
   * @param unit - unit of input ("ft" or "cm")
   * @returns validation result with height in cm if valid
   */
  static validateAndConvert(heightStr: string, unit: "ft" | "cm"): HeightValidationResult {
    if (!heightStr.trim()) {
      return { isValid: false, errorMessage: "Height is required" };
    }
    
    let heightInCm: number;
    
    if (unit === "cm") {
      const cm = parseFloat(heightStr.trim());
      if (isNaN(cm)) {
        return { isValid: false, errorMessage: "Please enter a valid number" };
      }
      heightInCm = cm;
    } else {
      heightInCm = HeightConverter.feetInchesToCm(heightStr);
      if (heightInCm === 0) {
        return { isValid: false, errorMessage: "Please enter a valid height (e.g., 5'8 or 5 8)" };
      }
    }
    
    // Validate reasonable bounds
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
  }

  /**
   * Check if height is within reasonable bounds
   * @param cm - height in centimeters
   * @returns true if height is reasonable
   */
  static isReasonableHeight(cm: number): boolean {
    return cm >= 91 && cm <= 244; // 3'0" to 8'0"
  }
}

// Formatting utilities
export class HeightFormatter {
  /**
   * Format height for input display
   * @param heightInCm - height in centimeters
   * @param unit - desired output unit
   * @returns formatted height string
   */
  static formatForDisplay(heightInCm: number, unit: "ft" | "cm"): string {
    if (unit === "cm") {
      return HeightConverter.roundToNearestCm(heightInCm).toString();
    } else {
      return HeightConverter.cmToFeetInches(heightInCm);
    }
  }

  /**
   * Format height for storage (always in cm, rounded to 1 decimal)
   * @param heightInCm - height in centimeters
   * @returns formatted height for storage
   */
  static formatForStorage(heightInCm: number): number {
    return HeightConverter.roundHeight(heightInCm, 1);
  }

  /**
   * Format height string (ft/in format) to user's preferred unit
   * @param ftHeight - height in feet/inches format (e.g., "5'8"")
   * @param preferredUnit - user's preferred unit ("ft" or "cm")
   * @returns formatted height string
   */
  static formatHeightForDisplay(ftHeight: string, preferredUnit: "ft" | "cm"): string {
    if (preferredUnit === "cm") {
      const cm = HeightConverter.feetInchesToCm(ftHeight);
      return `${Math.round(cm)}cm`;
    }
    return ftHeight;
  }

  /**
   * Format height for display, preserving original cm value when preferred unit is cm
   * @param originalCm - original height in centimeters
   * @param ftHeight - height in feet/inches format (e.g., "5'8"")
   * @param preferredUnit - user's preferred unit ("ft" or "cm")
   * @returns formatted height string
   */
  static formatHeightForDisplayPreserveOriginal(originalCm: number, ftHeight: string, preferredUnit: "ft" | "cm"): string {
    if (preferredUnit === "cm") {
      return `${Math.round(originalCm)}cm`;
    }
    return ftHeight;
  }
}

// Legacy functions for backward compatibility
export const getHeightForInput = (heightInCm: number, unit: "ft" | "cm"): string => {
  return HeightFormatter.formatForDisplay(heightInCm, unit);
};

export const parseHeightToCm = (heightStr: string, unit: "ft" | "cm"): number => {
  if (unit === "cm") {
    const cm = parseInt(heightStr.trim());
    return isNaN(cm) ? 0 : cm;
  } else {
    return HeightConverter.feetInchesToCm(heightStr);
  }
};

export const validateHeightInput = (heightStr: string, unit: "ft" | "cm"): HeightValidationResult => {
  return HeightValidator.validateAndConvert(heightStr, unit);
};

export const validateHeight = validateHeightInput; 
type ValidationResult = {
  missingFields: string[];
  isValid: boolean;
};

export const validateFields = (
  requiredFields: string[],
  data: Record<string, any>
): ValidationResult => {
  const missingFields: string[] = [];

  // Check if any required field is undefined, null, or an empty string
  requiredFields.forEach((field) => {
    if (!data[field] || data[field] === "") {
      missingFields.push(field); // Add field to missingFields if it's missing or empty
    }
  });

  return {
    missingFields,
    isValid: missingFields.length === 0, // Return true if no missing fields
  };
};

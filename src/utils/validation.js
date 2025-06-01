/**
 * Utility functions for form validation
 */

// Email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// URL regex pattern
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// Phone regex pattern (simple international format)
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * Validates if a value is not empty
 * @param {string} value - The value to check
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequired = (value, errorMessage = 'This field is required') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value is a valid email
 * @param {string} value - The value to check
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateEmail = (value, errorMessage = 'Please enter a valid email address') => {
  if (!value) return null; // Skip empty values (use validateRequired for required fields)
  
  if (!EMAIL_REGEX.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value is a valid URL
 * @param {string} value - The value to check
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateUrl = (value, errorMessage = 'Please enter a valid URL') => {
  if (!value) return null; // Skip empty values
  
  if (!URL_REGEX.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value has a minimum length
 * @param {string} value - The value to check
 * @param {number} length - The minimum length
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateMinLength = (value, length, errorMessage) => {
  if (!value) return null; // Skip empty values
  
  if (value.length < length) {
    return errorMessage || `Must be at least ${length} characters`;
  }
  return null;
};

/**
 * Validates if a value has a maximum length
 * @param {string} value - The value to check
 * @param {number} length - The maximum length
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateMaxLength = (value, length, errorMessage) => {
  if (!value) return null; // Skip empty values
  
  if (value.length > length) {
    return errorMessage || `Must be no more than ${length} characters`;
  }
  return null;
};

/**
 * Validates if a value is a valid phone number
 * @param {string} value - The value to check
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validatePhone = (value, errorMessage = 'Please enter a valid phone number') => {
  if (!value) return null; // Skip empty values
  
  if (!PHONE_REGEX.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value matches another value
 * @param {string} value - The value to check
 * @param {string} compareValue - The value to compare against
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateMatch = (value, compareValue, errorMessage = 'Values do not match') => {
  if (value !== compareValue) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value is within a numeric range
 * @param {number} value - The value to check
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateRange = (value, min, max, errorMessage) => {
  if (!value && value !== 0) return null; // Skip empty values except 0
  
  const numValue = Number(value);
  
  if (isNaN(numValue) || numValue < min || numValue > max) {
    return errorMessage || `Value must be between ${min} and ${max}`;
  }
  return null;
};

/**
 * Combines multiple validation functions and returns the first error
 * @param {string} value - The value to validate
 * @param {Array<Function>} validations - Array of validation functions
 * @returns {string|null} - First error message or null if all valid
 */
export const validateComposite = (value, validations) => {
  for (const validation of validations) {
    const error = validation(value);
    if (error) {
      return error;
    }
  }
  return null;
};

/**
 * Creates a validator for a whole form
 * @param {Object} validationSchema - Object mapping field names to validation functions
 * @returns {Function} - Function that validates an entire form
 */
export const createFormValidator = (validationSchema) => {
  return (values) => {
    const errors = {};
    
    for (const field in validationSchema) {
      const value = values[field];
      const validate = validationSchema[field];
      
      if (typeof validate === 'function') {
        const error = validate(value, values);
        if (error) {
          errors[field] = error;
        }
      } else if (Array.isArray(validate)) {
        // If an array of validation functions is provided
        const error = validateComposite(value, validate);
        if (error) {
          errors[field] = error;
        }
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };
};
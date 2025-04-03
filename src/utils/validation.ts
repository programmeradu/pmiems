/**
 * Validation utility functions for the Employee Management System
 */

/**
 * Validates an email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
  // Allow various phone number formats with optional country codes
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a username
 * @param username The username to validate
 * @returns True if the username is valid, false otherwise
 */
export const validateUsername = (username: string): boolean => {
  // Username should be at least 3 characters and contain only alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

/**
 * Validates a password
 * @param password The password to validate
 * @returns True if the password is valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Password should be at least 6 characters
  return password.length >= 6;
};

/**
 * Validates a date string
 * @param dateString The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const validateDate = (dateString: string): boolean => {
  // Check if the date is valid
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validates a number
 * @param value The value to validate
 * @returns True if the value is a valid number, false otherwise
 */
export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

/**
 * Validates a currency amount
 * @param amount The amount to validate
 * @returns True if the amount is a valid currency amount, false otherwise
 */
export const validateCurrency = (amount: string): boolean => {
  // Allow numbers with up to 2 decimal places
  const currencyRegex = /^\d+(\.\d{1,2})?$/;
  return currencyRegex.test(amount);
};

/**
 * Validates required fields in an object
 * @param object The object to validate
 * @param requiredFields Array of required field names
 * @returns An object with field names as keys and error messages as values
 */
export const validateRequired = (object: Record<string, any>, requiredFields: string[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  requiredFields.forEach(field => {
    if (!object[field] || (typeof object[field] === 'string' && object[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });
  
  return errors;
};

/**
 * Checks if an object has validation errors
 * @param errors The errors object
 * @returns True if there are errors, false otherwise
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

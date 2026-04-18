// backend/services/sanitize.js
import validator from 'validator';

/**
 * Sanitize input data to prevent XSS and injection attacks
 * @param {Object} data - The input data object to sanitize
 * @returns {Object} - Sanitized data object
 */
export const sanitizeInput = (data) => {
  const sanitized = {};
  
  for (let [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove control characters (ASCII 0-31, 127)
      let cleaned = validator.stripLow(value);
      
      // Trim whitespace from both ends
      cleaned = validator.trim(cleaned);
      
      // Escape HTML entities to prevent XSS
      cleaned = validator.escape(cleaned);
      
      // Optional: Normalize email if it's an email field
      if (key === 'email') {
        cleaned = validator.normalizeEmail(cleaned);
      }
      
      // Optional: Remove extra spaces (multiple spaces to single)
      if (key === 'username' || key === 'fullName') {
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
      }
      
      sanitized[key] = cleaned;
    } else if (Array.isArray(value)) {
      // Recursively sanitize arrays
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return validator.escape(validator.trim(validator.stripLow(item)));
        }
        return item;
      });
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else {
      // Numbers, booleans, etc. pass through as-is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize a single string value
 * @param {string} value - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  
  let cleaned = validator.stripLow(value);
  cleaned = validator.trim(cleaned);
  cleaned = validator.escape(cleaned);
  
  return cleaned;
};

/**
 * Sanitize email specifically
 * @param {string} email - The email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  let cleaned = validator.stripLow(email);
  cleaned = validator.trim(cleaned);
  cleaned = validator.normalizeEmail(cleaned);
  cleaned = validator.escape(cleaned);
  
  return cleaned;
};

/**
 * Sanitize username (only allow alphanumeric and underscore)
 * @param {string} username - The username to sanitize
 * @returns {string} - Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (typeof username !== 'string') return username;
  
  let cleaned = validator.stripLow(username);
  cleaned = validator.trim(cleaned);
  cleaned = cleaned.toLowerCase();
  // Remove any characters that aren't letters, numbers, or underscore
  cleaned = cleaned.replace(/[^a-z0-9_]/g, '');
  cleaned = validator.escape(cleaned);
  
  return cleaned;
};

/**
 * Sanitize phone number (only keep digits and +)
 * @param {string} phone - The phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-digit and non-plus characters
  let cleaned = phone.replace(/[^0-9+]/g, '');
  cleaned = validator.trim(cleaned);
  
  return cleaned;
};

/**
 * Deep sanitize function for complex objects
 * @param {Object} data - The data to sanitize
 * @returns {Object} - Fully sanitized data
 */
export const deepSanitize = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => deepSanitize(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }
  
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  return data;
};

/**
 * Sanitize request body middleware for Express
 * @param {Object} options - Configuration options
 * @returns {Function} - Express middleware
 */
export const sanitizeRequestBody = (options = {}) => {
  const { fields = [], exclude = [] } = options;
  
  return (req, res, next) => {
    if (req.body) {
      if (fields.length > 0) {
        // Only sanitize specified fields
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = sanitizeString(req.body[field]);
          }
        });
      } else if (exclude.length > 0) {
        // Sanitize all fields except excluded ones
        const sanitized = {};
        for (const [key, value] of Object.entries(req.body)) {
          if (exclude.includes(key)) {
            sanitized[key] = value;
          } else if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
          } else {
            sanitized[key] = value;
          }
        }
        req.body = sanitized;
      } else {
        // Sanitize entire request body
        req.body = sanitizeInput(req.body);
      }
    }
    next();
  };
};

// Default export for convenience
export default {
  sanitizeInput,
  sanitizeString,
  sanitizeEmail,
  sanitizeUsername,
  sanitizePhone,
  deepSanitize,
  sanitizeRequestBody
};
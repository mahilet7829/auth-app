// backend/validations/authValidation.js
import { body } from 'express-validator';

export const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .customSanitizer(value => value.toLowerCase()),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+251[0-9]{8}$/)
    .withMessage('Phone number must be in format +251 followed by 8 digits'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('birthdate')
    .notEmpty()
    .withMessage('Birthdate is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 12) {
        throw new Error('You must be at least 12 years old');
      }
      if (age > 120) {
        throw new Error('Please enter a valid birthdate');
      }
      return true;
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const signinValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username, email, or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const resendVerificationValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];
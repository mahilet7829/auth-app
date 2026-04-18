// backend/controllers/authController.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { sanitizeInput, sanitizeEmail, sanitizeUsername } from '../middleware/sanitize.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitize inputs
    const sanitizedData = sanitizeInput(req.body);
    const { fullName, username, email, phoneNumber, password, location, birthdate } = sanitizedData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, username, or phone number'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const user = new User({
      fullName,
      username,
      email,
      phoneNumber: phoneNumber || undefined,
      password,
      location,
      birthdate: new Date(birthdate),
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(201).json({
        message: 'User created successfully, but verification email failed to send. Please contact support.',
        requiresVerification: true
      });
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user account' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now sign in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// @desc    Sign in user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitize inputs
    const sanitizedData = sanitizeInput(req.body);
    const { identifier, password } = sanitizedData;

    // Find user by username, email, or phone number
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const remainingTime = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
      return res.status(401).json({
        message: `Account is locked. Please try again in ${remainingTime} minutes.`
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: 'Please verify your email before signing in.',
        requiresVerification: true
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementFailedLogins();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset failed login attempts on successful login
    await user.resetFailedLogins();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Send response without sensitive data
    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        birthdate: user.birthdate,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
};

// @desc    Google authentication
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { email, username, googleId, picture, fullName } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      // Create new user with Google data
      user = new User({
        fullName: fullName || username || email.split('@')[0],
        username: username || email.split('@')[0],
        email,
        googleId,
        picture,
        isEmailVerified: true,
        location: '',
        birthdate: new Date('2000-01-01'), // Default birthdate
        password: crypto.randomBytes(20).toString('hex')
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Google sign in successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        picture: user.picture,
        location: user.location,
        birthdate: user.birthdate
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Error with Google authentication' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        birthdate: user.birthdate,
        age: user.getAge(),
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
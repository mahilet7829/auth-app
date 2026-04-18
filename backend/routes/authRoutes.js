import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// Email configuration (add your email credentials in .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullname, username, email, phoneNumber, countryCode, location, birthdate, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      fullname,
      username,
      email,
      phoneNumber: phoneNumber || `${countryCode}${phoneNumber}`,
      countryCode,
      location,
      birthdate: new Date(birthdate),
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '1h' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, fullname: user.fullname, username: user.username, email: user.email, phonenumber: phoneNumber,countryCode: user.countryCode,location: user.location,birthdate: user.birthdate }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '1h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        fullname: user.fullname, 
        username: user.username, 
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+251',
        location: user.location || '',
        birthdate: user.birthdate
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal that email doesn't exist
      return res.json({ message: 'If that email exists, we\'ve sent a reset link' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send email
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.fullname || user.username},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Reset email sent to:', email);
    
    res.json({ message: 'If that email exists, we\'ve sent a reset link' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log('Password reset successful for:', user.email);
    
    res.json({ message: 'Password has been reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { email, username, googleId, picture } = req.body;
    
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    
    if (!user) {
      user = new User({
        fullname: username,
        username: username,
        email: email,
        googleId: googleId,
        picture: picture,
        location: 'Not specified',
        birthdate: new Date('2000-01-01'),
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '1h' });
    
    res.json({
      message: 'Google authentication successful',
      token,
      user: { id: user._id, fullname: user.fullname, username: user.username, email: user.email }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, no token provided',
        code: 'NO_TOKEN'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(401).json({ 
        message: 'Account is locked. Please try again later.',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.accountLockedUntil
      });
    }
    
    // Attach user to request
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired, please login again',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(401).json({ 
      message: 'Not authorized, token failed',
      code: 'AUTH_FAILED'
    });
  }
};


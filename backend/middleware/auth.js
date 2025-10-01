const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account deactivated', 
        message: 'Your account has been deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        message: 'Please log in again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'Token is malformed' 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without user if token is invalid
    next();
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    // First check normal authentication
    await auth(req, res, () => {});
    
    // Check if user is admin (you can define admin logic here)
    if (!req.user.isAdmin && req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ 
        error: 'Access forbidden', 
        message: 'Admin privileges required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Admin authentication failed' 
    });
  }
};

// Rate limiting middleware (simple implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const requestInfo = requests.get(key);
    
    if (now > requestInfo.resetTime) {
      requestInfo.count = 1;
      requestInfo.resetTime = now + windowMs;
      return next();
    }
    
    if (requestInfo.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000)
      });
    }
    
    requestInfo.count++;
    next();
  };
};

// Validate object ID middleware
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Error',
      message: `${field} already exists`,
      field
    });
  }
  
  // Mongoose cast error
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Invalid ID format'
    });
  }
  
  // Default error
  res.status(error.statusCode || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (req.user) {
      logData.userId = req.user._id;
      logData.username = req.user.username;
    }
    
    console.log(JSON.stringify(logData));
  });
  
  next();
};

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  rateLimit,
  validateObjectId,
  errorHandler,
  requestLogger
};
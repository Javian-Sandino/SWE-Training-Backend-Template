// backend/utils/auth.js
// Authentication utilities for JWT token management

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token for user
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token and return user
async function getUser(token) {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    return user;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

// Extract token from request headers
function getTokenFromHeaders(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GraphQL context function
async function createContext({ req }) {
  const token = getTokenFromHeaders(req);
  const user = await getUser(token);
  
  return {
    user,
    isAuthenticated: !!user
  };
}

module.exports = {
  generateToken,
  getUser,
  getTokenFromHeaders,
  createContext
};
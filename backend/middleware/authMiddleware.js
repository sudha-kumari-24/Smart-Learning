const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('🔐 Incoming token:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token payload:', JSON.stringify(decoded, null, 2));
    
    // Try finding by _id or id from token
    const userId = decoded.id || decoded._id || decoded.userId;
    console.log('🔐 Looking for user with id:', userId);
    
    req.user = await User.findById(userId).select('-passwordHash');
    
    if (!req.user) {
      console.log('❌ No user found with id:', userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('✅ User authenticated successfully:', req.user.fullName);
    next();
  } catch (error) {
    console.error('❌ JWT VERIFY ERROR:', error.message);
    return res.status(401).json({ message: 'Token invalid: ' + error.message });
  }
};
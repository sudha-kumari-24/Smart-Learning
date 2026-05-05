// controllers/authController.js

console.log('🔥 NEW AUTH CONTROLLER LOADED');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createToken(user) {
  return jwt.sign(
    { id: user._id, name: user.fullName, email: user.email },  // ✅ Uses 'id'
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

exports.register = async (req, res) => {
  console.log('🔥 REGISTER HIT');
  console.log('REGISTER BODY:', req.body);

  try {
    const {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      address,
      classCourse,
      schoolCollege,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      dateOfBirth,
      address,
      classCourse,
      schoolCollege,
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.fullName, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('LOGIN BODY:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Student';

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        googleId,
      });
    }
    else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = createToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error('Google auth error', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// ========== ADD THESE NEW FUNCTIONS ==========

// Get user profile (protected)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (protected)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      classCourse,
      schoolCollege,
      preferences
    } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Build update object
    const updateData = {
      fullName,
      email,
      phone,
      address,
      classCourse,
      schoolCollege,
      preferences
    };

    // Only add dateOfBirth if provided and valid
    if (dateOfBirth && dateOfBirth !== '') {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }

};







// Get user profile (protected)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (protected)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      classCourse,
      schoolCollege,
      preferences
    } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Build update object
    const updateData = {
      fullName,
      email,
      phone,
      address,
      classCourse,
      schoolCollege,
      preferences
    };

    // Only add dateOfBirth if provided and valid
    if (dateOfBirth && dateOfBirth !== '') {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
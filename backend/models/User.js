const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true,
    minlength: [3, 'Name must be at least 3 characters'],
    trim: true
  },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: [5, 'Email must be at least 5 characters'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },

  phone: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{10}$/.test(v); // allows empty OR 10 digit number
      },
      message: 'Phone must be a valid 10-digit number'
    }
  },

  dateOfBirth: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 5);
        return v <= minDate;
      },
      message: 'User must be at least 5 years old'
    }
  },

  address: { type: String },

  classCourse: { type: String },

  schoolCollege: { type: String },

  passwordHash: { 
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(v);
      },
      message: 'Password must include uppercase, lowercase, number, and special character'
    }
  },

  googleId: { type: String },

  // Existing fields untouched

  preferences: {
    studyGoalMinutesPerDay: { type: Number, default: 60 },
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening',
    },
    focusAreas: [{ type: String }],
  },

  goals: [
    {
      title: { type: String, minlength: 3 },
      type: {
        type: String,
        enum: ['time', 'course', 'habit'],
      },
      targetValue: { type: Number, min: 1 },
      currentValue: { type: Number, default: 0, min: 0 },
      startDate: Date,
      endDate: {
        type: Date,
        validate: {
          validator: function(v) {
            return !v || !this.startDate || v >= this.startDate;
          },
          message: 'End date must be after start date'
        }
      },
      status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
      },
    },
  ],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const { Schema, model } = require('mongoose');

const certificateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, unique: true },

  issuedAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = model('Certificate', certificateSchema);
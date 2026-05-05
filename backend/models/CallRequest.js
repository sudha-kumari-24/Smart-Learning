const { Schema, model, Types } = require('mongoose');

const callRequestSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: false },
  topic: { type: String, required: true }, // 'study' | 'career' | 'stress'
  note: { type: String, required: true },
  status: { type: String, enum: ['pending', 'scheduled', 'done'], default: 'pending' },
}, { timestamps: true });

module.exports = model('CallRequest', callRequestSchema);

const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ['online', 'offline'], default: 'online' },
  meetingLink: { type: String },
  location: { type: String },
  status: { type: String, enum: ['proposed', 'confirmed', 'completed', 'cancelled'], default: 'proposed' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);

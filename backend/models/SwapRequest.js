const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderSkill: { type: String, required: true },
  receiverSkill: { type: String, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  session: {
    dateTime: { type: Date },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmed: { type: Boolean, default: false },
    meetLink: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);

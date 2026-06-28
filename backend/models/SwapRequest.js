const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderSkill: { type: String, required: true },  // skill sender offers
  receiverSkill: { type: String, required: true }, // skill sender wants
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
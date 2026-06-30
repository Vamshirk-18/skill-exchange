const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

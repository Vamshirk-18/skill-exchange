const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
}, { timestamps: true });

// One rating per swap per reviewer
RatingSchema.index({ reviewer: 1, swapRequest: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
const Rating = require('../models/Rating');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @POST /api/rating/give
const giveRating = async (req, res) => {
  const { swapRequestId, revieweeId, rating, review } = req.body;
  try {
    // Check swap is accepted
    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap || swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only rate accepted swaps' });
    }

    // Check user is part of this swap
    const isPartOfSwap = swap.sender.toString() === req.user._id.toString() ||
                         swap.receiver.toString() === req.user._id.toString();
    if (!isPartOfSwap) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newRating = await Rating.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      swapRequest: swapRequestId,
      rating,
      review,
    });

    res.status(201).json(newRating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already rated this swap' });
    }
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/rating/:userId
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    const average = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    res.json({ ratings, average, total: ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { giveRating, getUserRatings };
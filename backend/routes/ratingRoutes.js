const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { giveRating, getUserRatings } = require('../controllers/ratingController');

router.post('/give', protect, giveRating);
router.get('/:userId', getUserRatings);

module.exports = router;
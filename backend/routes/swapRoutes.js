const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendSwapRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  cancelRequest
} = require('../controllers/swapController');

router.post('/send', protect, sendSwapRequest);
router.get('/received', protect, getReceivedRequests);
router.get('/sent', protect, getSentRequests);
router.put('/:id/respond', protect, respondToRequest);
router.delete('/:id', protect, cancelRequest);

module.exports = router;
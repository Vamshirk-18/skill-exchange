const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  proposeSession, confirmSession, completeSession, cancelSession,
  getSessionBySwap, getMySessions
} = require('../controllers/sessionController');

router.post('/propose', protect, proposeSession);
router.put('/:id/confirm', protect, confirmSession);
router.put('/:id/complete', protect, completeSession);
router.put('/:id/cancel', protect, cancelSession);
router.get('/mine', protect, getMySessions);
router.get('/swap/:swapId', protect, getSessionBySwap);

module.exports = router;

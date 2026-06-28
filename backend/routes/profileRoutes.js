const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, updateProfile, getAllProfiles, getProfileById } = require('../controllers/profileController');

router.get('/me', protect, getMyProfile);
router.put('/update', protect, updateProfile);
router.get('/all', getAllProfiles);
router.get('/:id', getProfileById);

module.exports = router;
const User = require('../models/User');

// @GET /api/profile/me
const getMyProfile = async (req, res) => {
  res.json(req.user);
};

// @PUT /api/profile/update
const updateProfile = async (req, res) => {
  const { bio, college, skillsToTeach, skillsToLearn, avatar } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { bio, college, skillsToTeach, skillsToLearn, avatar },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/profile/all  — browse all students
const getAllProfiles = async (req, res) => {
  try {
    const { skill } = req.query; // ?skill=React for search
    const filter = skill
      ? { skillsToTeach: { $regex: skill, $options: 'i' } }
      : {};
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/profile/:id
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, updateProfile, getAllProfiles, getProfileById };
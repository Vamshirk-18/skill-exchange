const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  bio: { type: String },
  skillsToTeach: [{ type: String }],  // e.g. ["React", "Python"]
  skillsToLearn: [{ type: String }],  // e.g. ["DSA", "UI Design"]
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
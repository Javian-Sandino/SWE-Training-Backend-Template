// backend/models/User.js
// Mongoose model for application users.

const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, default: 'user' },
  profile: {
    name: String,
    bio: String
  }
}, { timestamps: true });

module.exports = model('User', UserSchema);

const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    enum: [1, 2], // 1 = User, 2 = Admin
    default: 1
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

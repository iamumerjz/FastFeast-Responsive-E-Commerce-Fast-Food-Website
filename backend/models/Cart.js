const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [CartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);

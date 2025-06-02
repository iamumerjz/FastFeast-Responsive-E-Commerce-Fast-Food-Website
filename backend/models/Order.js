const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  subtotal: Number,
  tax: Number,
  discount: Number,
  deliveryFee: Number,
  total: Number,
  status: { type: String, default: "pending" },
  contactInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  addressInfo: {
    street: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);

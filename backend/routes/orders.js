const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');

async function generateUniqueOrderNumber() {
  let orderNumber;
  let exists = true;
  while (exists) {
    orderNumber = 'FF' + Math.floor(100000 + Math.random() * 900000);
    exists = await Order.exists({ orderNumber });
  }
  return orderNumber;
}


router.post("/", auth, async (req, res) => {
  try {
    const orderNumber = await generateUniqueOrderNumber();

    // Destructure your data from req.body
    const {
      cart,
      subtotal,
      tax,
      discount,
      deliveryFee,
      total,
      contactInfo,
      addressInfo
    } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const order = new Order({
      user: req.user.user_id,
      orderNumber,
      items: cart, // <-- THIS FIXES YOUR BUG!
      subtotal,
      tax,
      discount,
      deliveryFee,
      total,
      contactInfo,
      addressInfo
    });

    await order.save();
    await Cart.findOneAndDelete({ user: req.user.user_id });
    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET /api/orders/my
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.user_id; // Use user_id, not _id
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    // Fetch the user from DB
    const user = await User.findById(req.user.user_id);
    if (!user || user.role !== 2) {
      return res.status(403).json({ message: "Access denied" });
    }
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/:id/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user || user.role !== 2) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { status } = req.body;
    if (!["pending", "preparing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// routes/orders.js

// Add this route to your routes/orders.js

router.get("/stats", auth, async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. Today's Revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    // 4. Total Revenue (all time)
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 5. Monthly Growth
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: firstOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const lastMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: firstOfLastMonth, $lt: firstOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const thisMonth = thisMonthAgg[0]?.total || 0;
    const lastMonth = lastMonthAgg[0]?.total || 0;
    let monthlyGrowth = 0;
    if (lastMonth > 0) {
      monthlyGrowth = (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1);
    } else if (thisMonth > 0) {
      monthlyGrowth = 100;
    }

    res.json({
      totalUsers,
      totalOrders,
      todayRevenue,
      totalRevenue,
      monthlyGrowth
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;

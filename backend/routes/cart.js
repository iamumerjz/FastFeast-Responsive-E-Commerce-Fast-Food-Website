const express = require("express");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/cart - Get current user's cart (populated)
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.user_id }).populate("items.menuItem");
    if (!cart) {
      // Create a new cart if not found
      cart = await Cart.create({ user: req.user.user_id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart/add - Add item (or increase quantity if exists)
router.post("/add", auth, async (req, res) => {
  const { menuItemId, quantity } = req.body;
  if (!menuItemId || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Invalid item or quantity." });
  }
  try {
    let cart = await Cart.findOne({ user: req.user.user_id });
    if (!cart) cart = new Cart({ user: req.user.user_id, items: [] });

    const idx = cart.items.findIndex(i => i.menuItem.toString() === menuItemId);
    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({ menuItem: menuItemId, quantity });
    }
    await cart.save();
    await cart.populate("items.menuItem");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart/update - Set quantity for an item
router.post("/update", auth, async (req, res) => {
  const { menuItemId, quantity } = req.body;
  if (!menuItemId || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Invalid item or quantity." });
  }
  try {
    let cart = await Cart.findOne({ user: req.user.user_id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    const idx = cart.items.findIndex(i => i.menuItem.toString() === menuItemId);
    if (idx > -1) {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();
    await cart.populate("items.menuItem");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart/remove - Remove item
router.post("/remove", auth, async (req, res) => {
  const { menuItemId } = req.body;
  if (!menuItemId) return res.status(400).json({ message: "Missing menuItemId." });
  try {
    let cart = await Cart.findOne({ user: req.user.user_id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    cart.items = cart.items.filter(i => i.menuItem.toString() !== menuItemId);
    await cart.save();
    await cart.populate("items.menuItem");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart - Clear and DELETE the cart (used after order)
router.delete("/", auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.user_id });
    res.json({ message: "Cart deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

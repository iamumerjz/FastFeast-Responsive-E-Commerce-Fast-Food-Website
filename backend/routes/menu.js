const express = require('express');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Store in /uploads, keep original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --------- ADD MENU ITEM (ADMIN ONLY) ----------
router.post('/add', auth, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user || user.role !== 2) {
      return res.status(403).json({ message: 'Admins only' });
    }

    const { name, category, price, description, available } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    let imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const menuItem = new MenuItem({
      name,
      category,
      price: parseFloat(price),
      description,
      image: imageUrl,
      available
    });
    await menuItem.save();
    res.status(201).json({ message: 'Menu item added!', menuItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --------- GET ALL MENU ITEMS (PUBLIC) ----------
router.get('/all', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------- UPDATE MENU ITEM (ADMIN ONLY) ----------
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user || user.role !== 2) {
      return res.status(403).json({ message: 'Admins only' });
    }

    const { name, category, price, description, available } = req.body;
    let updatedFields = { name, category, price, description, available };

    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }
    if (updatedFields.price) updatedFields.price = parseFloat(updatedFields.price);

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Menu item not found." });
    res.json({ message: "Menu item updated!", menuItem: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --------- DELETE MENU ITEM (ADMIN ONLY) ----------
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user || user.role !== 2) {
      return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }

    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Menu item not found." });

    res.json({ message: "Menu item deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

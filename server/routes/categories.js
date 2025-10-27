const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Create category
router.post('/', async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = new Category({ name, slug });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

module.exports = router;

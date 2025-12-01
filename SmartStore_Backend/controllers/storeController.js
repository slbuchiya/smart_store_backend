// controllers/storeController.js (replace the create export)
const bcrypt = require('bcrypt');
const Store = require('../models/Store');

exports.create = async (req, res) => {
  try {
    console.log('Received store creation request:', req.body);

    // clone payload so we can modify safely
    const payload = { ...req.body };

    // Provide a default expiryDate (1 year) if frontend didn't send one
    if (!payload.expiryDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      payload.expiryDate = d.toISOString();
      console.log('No expiryDate provided — setting default:', payload.expiryDate);
    }

    // Basic required fields check (matches your model)
    const required = ['storeId', 'password', 'storeName', 'ownerName', 'mobile', 'expiryDate'];
    const missing = required.filter(f => !payload[f] && payload[f] !== 0);
    if (missing.length) {
      console.warn('Missing required fields:', missing);
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    // Hash password if not already hashed
    if (payload.password && !payload.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
      console.log('Password hashed for storeId:', payload.storeId);
    }

    const newStore = new Store(payload);
    await newStore.save();

    console.log('Store saved successfully:', { storeId: newStore.storeId, id: newStore._id });
    const out = newStore.toObject();
    delete out.password;
    return res.status(201).json(out);
  } catch (err) {
    console.error('Error saving store (full):', err);
    // handle duplicate key (unique index) specifically
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate storeId or unique field conflict' });
    }
    // send back clear message
    return res.status(400).json({ error: err.message || 'Failed to create store' });
  }
};

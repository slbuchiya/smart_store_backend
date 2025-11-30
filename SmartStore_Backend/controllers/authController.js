// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Store = require('../models/Store');

exports.storeLogin = async (req, res) => {
  try {
    const { storeId, password } = req.body;

    if (!storeId || !password) {
      return res.status(400).json({ error: 'storeId and password are required' });
    }

    const store = await Store.findOne({ storeId });
    if (!store) {
      console.warn(`Login attempt: store not found for storeId=${storeId}`);
      return res.status(404).json({ error: 'Store not found' });
    }

    // If password stored hashed (recommended)
    const isHashed = typeof store.password === 'string' && store.password.startsWith('$2');
    if (isHashed) {
      const match = await bcrypt.compare(password, store.password);
      if (!match) {
        console.warn(`Invalid password for storeId=${storeId}`);
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      // fallback (not recommended for production)
      if (store.password !== password) {
        console.warn(`Invalid plain password for storeId=${storeId}`);
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    if (store.status === 'suspended') {
      return res.status(403).json({ error: 'Account Suspended' });
    }

    const token = jwt.sign(
      { id: store._id, storeId: store.storeId, role: 'store_owner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      storeId: store.storeId,
      storeName: store.storeName,
      ownerName: store.ownerName,
      mobile: store.mobile
    });

  } catch (err) {
    console.error('storeLogin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Store = require('../models/Store');

/**
 * Store login
 * Expects: { storeId, password }
 */
exports.storeLogin = async (req, res) => {
  try {
    const { storeId, password } = req.body;

    if (!storeId || !password) {
      return res.status(400).json({ error: 'storeId and password are required' });
    }

    const store = await Store.findOne({ storeId });
    if (!store) {
      console.warn(`Login attempt failed: store not found (storeId=${storeId})`);
      return res.status(404).json({ error: 'Store not found' });
    }

    // Detect if password is bcrypt-hashed (starts with $2a/$2b/$2y)
    const isHashed = typeof store.password === 'string' && store.password.startsWith('$2');
    if (isHashed) {
      const match = await bcrypt.compare(password, store.password);
      if (!match) {
        console.warn(`Invalid password for storeId=${storeId}`);
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      // fallback (not recommended): plain-text comparison
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
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' }
    );

    // Return useful store info (avoid returning password)
    res.json({
      token,
      store: {
        id: store._id,
        storeId: store.storeId,
        storeName: store.storeName,
        ownerName: store.ownerName,
        mobile: store.mobile,
        email: store.email,
        status: store.status
      }
    });

  } catch (err) {
    console.error('storeLogin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Admin login (simple example)
 */
exports.adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    if (adminId === "admin" && password === "admin123") {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });
      return res.json({ token, role: 'admin', name: 'Super Admin' });
    } else {
      return res.status(401).json({ error: 'Invalid Admin Credentials' });
    }
  } catch (err) {
    console.error('adminLogin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// scripts/seed_store.js
require('dotenv').config();
const mongoose = require('mongoose');
const Store = require('../models/Store'); // adjust path if you place script elsewhere
const bcrypt = require('bcrypt');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const data = {
      storeId: 'demo123',
      password: '123456',
      storeName: 'Demo Store',
      ownerName: 'Sachin',
      mobile: '9876543210',
      email: 'demo@example.com',
      address: 'Surat',
      gst: 'GST0000',
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };

    // hash password
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    const existing = await Store.findOne({ storeId: data.storeId });
    if (existing) {
      console.log('Store already exists:', existing.storeId);
    } else {
      const s = new Store(data);
      await s.save();
      console.log('Seed store created:', s.storeId);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

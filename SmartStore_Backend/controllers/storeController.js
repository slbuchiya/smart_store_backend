// controllers/storeController.js
const bcrypt = require("bcrypt");
const Store = require("../models/Store");

// GET /api/stores
exports.list = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json(stores.map(s => {
      const o = s.toObject();
      delete o.password;
      return o;
    }));
  } catch (err) {
    console.error("store.list error:", err);
    res.status(500).json({ error: "Failed to list stores" });
  }
};

// POST /api/stores
exports.create = async (req, res) => {
  try {
    console.log("Received store creation request:", req.body);
    const payload = { ...req.body };

    // Default expiryDate to 1 year from now if missing
    if (!payload.expiryDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      payload.expiryDate = d.toISOString();
      console.log("expiryDate not provided — defaulting to:", payload.expiryDate);
    }

    // Required fields (match your model)
    const required = ["storeId", "password", "storeName", "ownerName", "mobile", "expiryDate"];
    const missing = required.filter(f => {
      return payload[f] === undefined || payload[f] === null || payload[f] === "";
    });
    if (missing.length) {
      console.warn("Missing required fields:", missing);
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    // Hash password if not already hashed
    if (payload.password && !String(payload.password).startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(String(payload.password), salt);
      console.log("Password hashed for storeId:", payload.storeId);
    }

    const newStore = new Store(payload);
    await newStore.save();

    console.log("Store saved successfully:", { storeId: newStore.storeId, id: newStore._id });

    const out = newStore.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (err) {
    console.error("Error saving store (full):", err);
    if (err && err.code === 11000) {
      return res.status(400).json({ error: "Duplicate storeId or unique field conflict" });
    }
    res.status(400).json({ error: err.message || "Failed to create store" });
  }
};

// PUT /api/stores/:storeId
exports.update = async (req, res) => {
  try {
    const updated = await Store.findOneAndUpdate(
      { storeId: req.params.storeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Store not found" });
    const out = updated.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error("store.update error:", err);
    res.status(400).json({ error: err.message || "Failed to update store" });
  }
};

// DELETE /api/stores/:storeId
exports.remove = async (req, res) => {
  try {
    await Store.findOneAndDelete({ storeId: req.params.storeId });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("store.remove error:", err);
    res.status(400).json({ error: err.message || "Failed to delete store" });
  }
};

// PUT /api/stores/profile (authenticated route)
exports.updateProfile = async (req, res) => {
  try {
    const updated = await Store.findOneAndUpdate(
      { storeId: req.storeId },
      {
        storeName: req.body.storeName,
        address: req.body.address,
        mobile: req.body.mobile,
        gst: req.body.gst
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Store not found" });
    const out = updated.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(400).json({ error: err.message || "Failed to update profile" });
  }
};

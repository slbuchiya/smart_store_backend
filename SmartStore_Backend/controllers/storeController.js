const bcrypt = require("bcrypt");
const Store = require("../models/Store");

// GET All Stores
exports.list = async (req, res) => {
  const stores = await Store.find().sort({ createdAt: -1 });
  res.json(stores);
};

// CREATE Store
exports.create = async (req, res) => {
  try {
    console.log("Create Store Request:", req.body);

    const payload = { ...req.body };

    // Auto-default expiryDate (1 year) if missing
    if (!payload.expiryDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      payload.expiryDate = d.toISOString();
    }

    // Validation
    const required = ["storeId", "password", "storeName", "ownerName", "mobile", "expiryDate"];
    const missing = required.filter((f) => !payload[f]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    // Hash password
    if (!payload.password.startsWith("$2")) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const newStore = new Store(payload);
    await newStore.save();

    console.log("Store saved:", newStore.storeId);
    const output = newStore.toObject();
    delete output.password;

    res.status(201).json(output);
  } catch (err) {
    console.error("Store Create Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "storeId must be unique" });
    }
    res.status(400).json({ error: err.message });
  }
};

// UPDATE Store
exports.update = async (req, res) => {
  try {
    const { storeId } = req.params;

    const updated = await Store.findOneAndUpdate(
      { storeId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Store Update Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE Store
exports.remove = async (req, res) => {
  await Store.findOneAndDelete({ storeId: req.params.storeId });
  res.json({ message: "Deleted Successfully" });
};

// Store Owner Profile Update
exports.updateProfile = async (req, res) => {
  const updated = await Store.findOneAndUpdate(
    { storeId: req.storeId },
    {
      storeName: req.body.storeName,
      address: req.body.address,
      mobile: req.body.mobile,
      gst: req.body.gst
    },
    { new: true }
  );
  res.json(updated);
};

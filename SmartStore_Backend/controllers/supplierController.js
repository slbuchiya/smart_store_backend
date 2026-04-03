const Supplier = require('../models/Supplier');

exports.list = async (req, res) => {
    const list = await Supplier.find({ storeId: req.storeId });
    res.json(list);
};

exports.create = async (req, res) => {
    const supplier = new Supplier({ ...req.body, storeId: req.storeId });
    await supplier.save();
    res.json(supplier);
};

// ✅ આ નવું UPDATE ફંક્શન ઉમેર્યું છે (જેના લીધે એરર આવતી હતી)
exports.update = async (req, res) => {
    try {
        const updated = await Supplier.findOneAndUpdate(
            { _id: req.params.id, storeId: req.storeId },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Supplier not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    await Supplier.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
    res.json({ message: 'Deleted' });
};
const Receipt = require('../models/Receipt');

// List Receipts
exports.list = async (req, res) => {
    try {
        const list = await Receipt.find({ storeId: req.storeId }).sort({ date: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Receipt
exports.create = async (req, res) => {
    try {
        const partyName = req.body.partyName || req.body.name || req.body.customerName || 'Unknown';
        const receipt = new Receipt({
            ...req.body,
            partyName,
            storeId: req.storeId
        });
        await receipt.save();
        res.status(201).json(receipt);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Remove Receipt
exports.remove = async (req, res) => {
    try {
        await Receipt.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
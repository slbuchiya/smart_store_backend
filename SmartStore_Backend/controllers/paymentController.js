const Payment = require('../models/Payment');

// List Payments
exports.list = async (req, res) => {
    try {
        const list = await Payment.find({ storeId: req.storeId }).sort({ date: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Payment
exports.create = async (req, res) => {
    try {
        const partyName = req.body.partyName || req.body.name || req.body.supplierName || 'Unknown';
        const payment = new Payment({
            ...req.body,
            partyName,
            storeId: req.storeId
        });
        await payment.save();
        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Remove Payment
exports.remove = async (req, res) => {
    try {
        await Payment.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// 👇 ફાઈલનું નામ અને પાથ સાચો હોવો જોઈએ ('../models/Payment')
const Payment = require('../models/Payment');

exports.list = async (req, res) => {
    try {
        const list = await Payment.find({ storeId: req.storeId }).sort({ date: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        // 👇 આ 'new Payment' વાળી લાઈન પર જ તમારી એરર આવે છે
        const payment = new Payment({
            ...req.body,
            partyName: req.body.partyName || req.body.supplierName || 'Unknown',
            storeId: req.storeId
        });
        await payment.save();
        res.status(201).json(payment);
    } catch (err) {
        console.error("Payment Create Error:", err);
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await Payment.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
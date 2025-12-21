const Transaction = require('../models/Transaction');

// List transactions
exports.list = async (req, res) => {
    try {
        const filter = { storeId: req.storeId };
        if (req.query.type) {
            filter.type = req.query.type;
        }
        const txns = await Transaction.find(filter).sort({ date: -1 });
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Transaction
exports.create = async (req, res) => {
    try {
        const type = req.body.type || req.query.type;
        if (!type) {
            return res.status(400).json({ error: "Transaction type (Receipt/Payment) is required" });
        }
        const txn = new Transaction({
            ...req.body,
            type: type,
            storeId: req.storeId
        });
        await txn.save();
        res.status(201).json(txn);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
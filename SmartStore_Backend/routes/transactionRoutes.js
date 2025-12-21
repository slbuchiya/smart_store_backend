const Transaction = require('../models/Transaction');

// List transactions (Filtered by Type if provided)
exports.list = async (req, res) => {
    try {
        const filter = { storeId: req.storeId };
        
        // જો index.js માંથી query.type (Receipt/Payment) આવે તો ફિલ્ટર કરો
        if (req.query.type) {
            filter.type = req.query.type;
        }

        const txns = await Transaction.find(filter).sort({ date: -1 });
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Transaction (Auto-add Type from Route)
exports.create = async (req, res) => {
    try {
        // જો Body માં type ના હોય, તો URL query માંથી લો (index.js middleware)
        const type = req.body.type || req.query.type;

        if (!type) {
            return res.status(400).json({ error: "Transaction type (Receipt/Payment) is required" });
        }

        const txn = new Transaction({ 
            ...req.body, 
            type: type, // Ensure type is saved
            storeId: req.storeId 
        });
        
        await txn.save();
        res.status(201).json(txn);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
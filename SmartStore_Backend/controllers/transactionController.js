const Transaction = require('../models/Transaction');

// List transactions
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

// Create Transaction
exports.create = async (req, res) => {
    try {
        // 1. Type નક્કી કરો
        const type = req.body.type || req.query.type;
        if (!type) {
            return res.status(400).json({ error: "Transaction type (Receipt/Payment) is required" });
        }

        // 2. partyName માટે સ્માર્ટ ચેકિંગ (Fix for Validation Error)
        // જો ફ્રન્ટએન્ડ 'name' અથવા 'customerName' મોકલે તો તેને 'partyName' ગણો
        const partyName = req.body.partyName || req.body.name || req.body.customerName || req.body.supplierName || 'Unknown Party';

        const txn = new Transaction({
            ...req.body,
            partyName: partyName, // અહિયાં સુધારો કર્યો છે
            type: type,
            storeId: req.storeId
        });

        await txn.save();
        res.status(201).json(txn);
    } catch (err) {
        console.error("Transaction Error:", err);
        res.status(400).json({ error: err.message });
    }
};
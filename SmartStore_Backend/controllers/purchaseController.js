const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// 1. Create Purchase (Increase Stock)
exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const purchaseData = { ...req.body, storeId: req.storeId };

        const purchase = new Purchase(purchaseData);
        await purchase.save({ session });

        // Increase Stock
        for (const line of purchaseData.lines) {
            await Product.findOneAndUpdate(
                { _id: line.productId, storeId: req.storeId },
                { $inc: { stock: Number(line.qty) } },
                { session }
            );
        }

        await session.commitTransaction();
        res.status(201).json(purchase);
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
};

// 2. List Purchases
exports.list = async (req, res) => {
    try {
        const purchases = await Purchase.find({ storeId: req.storeId }).sort({ date: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete Purchase (Decrease Stock) -> ✅ NEW FUNCTION
exports.remove = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const purchaseId = req.params.id;

        // ખરીદી શોધો
        const purchase = await Purchase.findOne({ _id: purchaseId, storeId: req.storeId });
        if (!purchase) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Purchase not found" });
        }

        // A. Reverse Stock (જેટલો માલ ખરીદ્યો હતો તે પાછો ઓછો કરો)
        for (const line of purchase.lines) {
            if (line.productId) {
                await Product.findOneAndUpdate(
                    { _id: line.productId, storeId: req.storeId },
                    { $inc: { stock: -Number(line.qty) } }, // સ્ટોક ઘટાડો
                    { session }
                );
            }
        }

        // B. Delete Purchase Entry
        await Purchase.findByIdAndDelete(purchaseId, { session });

        await session.commitTransaction();
        res.json({ message: "Purchase deleted and stock adjusted successfully" });

    } catch (err) {
        await session.abortTransaction();
        console.error("Delete Purchase Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
};
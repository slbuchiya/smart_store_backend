const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// 1. Create Purchase (Latest Price Update Logic)
exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const purchaseData = { ...req.body, storeId: req.storeId };

        // Save Purchase Entry
        const purchase = new Purchase(purchaseData);
        await purchase.save({ session });

        // Update Product Stock & Set Latest Cost Price
        for (const line of purchaseData.lines) {
            // સીધો અપડેટ કમાન્ડ (હવે જૂની કિંમત કે એવરેજ કાઢવાની જરૂર નથી)
            if (line.productId) {
                await Product.findOneAndUpdate(
                    { _id: line.productId, storeId: req.storeId },
                    {
                        $inc: { stock: Number(line.qty) }, // સ્ટોક વધારો
                        $set: { costPrice: Number(line.price) } // ✅ ફેરફાર: સીધી નવી કિંમત સેટ કરો (Latest Price)
                    },
                    { session }
                );
            }
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

// 3. Delete Purchase (Decrease Stock)
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
        // Note: Delete કરતી વખતે આપણે Average Cost પાછી બદલતા નથી, તે જટિલ છે.
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
// 4. Update Purchase
exports.update = async (req, res) => {
    try {
        const idParam = req.params.id; // અહીં 'PUR-2026-0002' આવશે

        // અહિયાં _id ની જગ્યાએ 'purchaseId' ફિલ્ડથી ડેટા સર્ચ કરીશું
        const updatedPurchase = await Purchase.findOneAndUpdate(
            { purchaseId: idParam, storeId: req.storeId }, 
            req.body,
            { new: true }
        );

        if (!updatedPurchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }

        res.json(updatedPurchase);
    } catch (err) {
        console.error("Update Purchase Error:", err);
        res.status(500).json({ error: err.message });
    }
};
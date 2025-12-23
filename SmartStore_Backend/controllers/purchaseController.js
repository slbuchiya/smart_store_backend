const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// 1. Create Purchase (with Weighted Average Cost Logic)
exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const purchaseData = { ...req.body, storeId: req.storeId };

        // Save Purchase Entry
        const purchase = new Purchase(purchaseData);
        await purchase.save({ session });

        // Update Product Stock & Calculate Weighted Average Cost
        for (const line of purchaseData.lines) {
            // પ્રોડક્ટ શોધો (Find Product)
            const product = await Product.findOne({ _id: line.productId, storeId: req.storeId }).session(session);

            if (product) {
                const oldStock = Number(product.stock) || 0;
                const oldCost = Number(product.costPrice) || 0;
                const newQty = Number(line.qty) || 0;
                const newCost = Number(line.price) || 0; // ખરીદી કિંમત (Purchase Price)

                // 🔢 Weighted Average Formula:
                // (જૂનો સ્ટોક કિંમત + નવો સ્ટોક કિંમત) / કુલ સ્ટોક
                let updatedCostPrice = oldCost;
                const totalQty = oldStock + newQty;

                if (totalQty > 0) {
                    const totalOldValue = oldStock * oldCost;
                    const totalNewValue = newQty * newCost;
                    updatedCostPrice = (totalOldValue + totalNewValue) / totalQty;
                }

                // અપડેટ કરો: નવો સ્ટોક અને નવી એવરેજ કિંમત
                await Product.findOneAndUpdate(
                    { _id: line.productId, storeId: req.storeId },
                    {
                        $inc: { stock: newQty }, // સ્ટોક વધારો
                        $set: { costPrice: Number(updatedCostPrice.toFixed(2)) } // નવી સરેરાશ કિંમત સેટ કરો
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
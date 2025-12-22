const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// 1. Create Sale (With Transaction)
exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const saleData = { ...req.body, storeId: req.storeId };

        // A. Save Sale
        const sale = new Sale(saleData);
        await sale.save({ session });

        // B. Decrease Stock
        for (const line of saleData.lines) {
            await Product.findOneAndUpdate(
                { _id: line.productId, storeId: req.storeId },
                { $inc: { stock: -Number(line.qty) } }, // સ્ટોક ઘટાડો
                { session }
            );
        }

        await session.commitTransaction();
        res.status(201).json(sale);
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
};

// 2. List Sales
exports.list = async (req, res) => {
    try {
        const sales = await Sale.find({ storeId: req.storeId }).sort({ date: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete Sale (Restore Stock) -> ✅ NEW FUNCTION
exports.remove = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const saleId = req.params.id;

        // વેચાણ શોધો
        const sale = await Sale.findOne({ _id: saleId, storeId: req.storeId });
        if (!sale) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Sale not found" });
        }

        // A. Restore Stock (જેટલો માલ વેચાયો હતો તે પાછો ઉમેરો)
        for (const line of sale.lines) {
            if (line.productId) {
                await Product.findOneAndUpdate(
                    { _id: line.productId, storeId: req.storeId },
                    { $inc: { stock: Number(line.qty) } }, // સ્ટોક પાછો વધારો
                    { session }
                );
            }
        }

        // B. Delete Sale Entry
        await Sale.findByIdAndDelete(saleId, { session });

        await session.commitTransaction();
        res.json({ message: "Sale deleted and stock restored successfully" });

    } catch (err) {
        await session.abortTransaction();
        console.error("Delete Sale Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
};
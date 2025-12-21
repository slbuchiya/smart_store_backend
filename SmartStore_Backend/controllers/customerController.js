const Customer = require('../models/Customer');

exports.list = async (req, res) => {
    try {
        const customers = await Customer.find({ storeId: req.storeId }).sort({ name: 1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const customer = new Customer({ ...req.body, storeId: req.storeId });
        await customer.save();
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Customer.findOneAndUpdate(
            { _id: req.params.id, storeId: req.storeId },
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await Customer.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
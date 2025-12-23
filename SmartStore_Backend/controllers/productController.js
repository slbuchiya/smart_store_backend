const Product = require('../models/Product');

exports.list = async (req, res) => {
    const products = await Product.find({ storeId: req.storeId });
    res.json(products);
};

// ✅ FIX: Create વખતે ડુપ્લીકેટ ચેક કરો
exports.create = async (req, res) => {
    try {
        const { name } = req.body;

        // 1. ચેક કરો કે પ્રોડક્ટ પહેલાથી છે કે નહીં (Case Insensitive: Book == book)
        const existingProduct = await Product.findOne({
            storeId: req.storeId,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingProduct) {
            return res.status(400).json({ error: 'Product already exists with this name.' });
        }

        // 2. જો ન હોય, તો જ નવી બનાવો
        const product = new Product({ ...req.body, storeId: req.storeId });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        // Update વખતે પણ નામ ચેક કરવું હોય તો કરી શકાય, પણ અત્યારે create માટે જરૂરી છે.
        const updated = await Product.findOneAndUpdate(
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
    await Product.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
    res.json({ message: 'Product deleted' });
};
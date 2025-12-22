const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    saleId: { type: String, required: true }, // e.g. SAL-2025-001
    customerName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: String,

    lines: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        qty: Number,
        price: Number,
        taxPercent: Number,
        discountPercent: Number
    }],

    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number,

    paymentStatus: { type: String, default: 'Unpaid' },
    amountPaid: { type: Number, default: 0 },
    paymentMode: String,
    balanceDue: { type: Number, default: 0 }
}, { timestamps: true });

// ✅ FIX: આ ભાગ ઉમેરો જેથી Frontend ને 'id' મળે
saleSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id; // _id ને id માં બદલો
        delete ret._id;
    }
});

module.exports = mongoose.model('Sale', saleSchema);
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    // ... તમારા જૂના ફીલ્ડ્સ એમના એમ જ રાખો ...
    storeId: { type: String, required: true, index: true },
    purchaseId: { type: String, required: true },
    supplierName: { type: String, required: true },
    billNo: String,
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
    total: Number,
    amountPaid: { type: Number, default: 0 },
    paymentStatus: String,
    balanceDue: Number
}, { timestamps: true });

// ✅ આ ભાગ ખાસ હોવો જોઈએ:
purchaseSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id; // _id ને id માં ફેરવો
        delete ret._id;
    }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
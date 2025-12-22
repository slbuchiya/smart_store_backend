const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    partyName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, default: 'Cash' },
    note: String
}, { timestamps: true });

// Frontend માટે _id ને id માં બદલવા
paymentSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { ret.id = ret._id; delete ret._id; }
});

// 👇 આ લાઈન હોવી જ જોઈએ!
module.exports = mongoose.model('Payment', paymentSchema);
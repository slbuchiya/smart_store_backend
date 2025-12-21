const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    partyName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, default: 'Cash' },
    note: String
}, { timestamps: true });

receiptSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Receipt', receiptSchema);
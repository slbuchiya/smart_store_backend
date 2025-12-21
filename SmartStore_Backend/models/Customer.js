const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    contact: String,
    address: String,
    email: String
}, { timestamps: true });

// Frontend needs 'id' instead of '_id'
customerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Customer', customerSchema);
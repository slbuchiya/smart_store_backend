require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// ==========================
// 1. Core Routes
// ==========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// ==========================
// 2. Ledger Route (Fixed)
// ==========================
// આ ફાઈલ હોવી ફરજિયાત છે: ./routes/customerRoutes.js
appVm.use('/api/customers', require('./routes/customerRoutes'));

// ==========================
// 3. Finance Routes (Receipts & Payments)
// ==========================
// આ ફાઈલ હોવી ફરજિયાત છે: ./routes/transactionRoutes.js
const transactionRoutes = require('./routes/transactionRoutes');

// Middleware to force 'type' for Receipts
app.use('/api/receipts', (req, res, next) => {
    req.query.type = 'Receipt';
    next();
}, transactionRoutes);

// Middleware to force 'type' for Payments
app.use('/api/payments', (req, res, next) => {
    req.query.type = 'Payment';
    next();
}, transactionRoutes);

// General Finance Route (Optional)
app.use('/api/finance', transactionRoutes);

// ==========================
// 4. Server Start
// ==========================
app.get('/', (req, res) => res.send('SmartStore API is Running...'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
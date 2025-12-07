// index.js update
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Routes Mapping (Frontend Context sathe match karva)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));

// 👇 aa nava routes add karva padse
//app.use('/api/ledgers', require('./routes/customerRoutes')); // Customers mate
app.use('/api/settings', require('./routes/settingsRoutes')); // Settings mate

// Finance (Receipts & Payments) ne Transaction route sathe jodiye
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/receipts', (req, res, next) => { req.query.type = 'Receipt'; next(); }, nHtransactionRoutes);
app.use('/api/payments', (req, res, next) => { req.query.type = 'Payment'; next(); }, transactionRoutes);
app.use('/api/finance', transactionRoutes);

app.get('/', (req, res) => res.send('SmartStore API is Running...'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
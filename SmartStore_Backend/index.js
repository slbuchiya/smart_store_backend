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
// Routes Mapping
// ==========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

// ✅ OLD Transaction Routes removed
// ✅ NEW: Separate Routes for Receipts & Payments
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Root Endpoint
app.get('/', (req, res) => res.send('SmartStore API is Running...'));

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
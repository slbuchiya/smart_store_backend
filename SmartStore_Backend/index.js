require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Routes Mapping
// ... બાકીનો કોડ સેમ રહેશે ...

// Routes Mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// ✅ Customers (Ledger) Route - આ લાઈન અન-કમેન્ટ કરો અને 'customers' કરો
app.use('/api/customers', require('./routes/customerRoutes'));

// Finance Routes (Receipts & Payments)
const transactionRoutes = require('./routes/transactionRoutes');

// Middleware to force 'type' based on route
app.use('/api/receipts', (req, res, next) => { req.query.type = 'Receipt'; next(); }, transactionRoutes);
app.use('/api/payments', (req, res, next) => { req.query.type = 'Payment'; next(); }, transactionRoutes);
app.use('/api/finance', transactionRoutes);


app.get('/', (req, res) => res.send('SmartStore API is Running...'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

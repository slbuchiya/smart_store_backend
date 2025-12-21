const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Routes
router.get('/', controller.list);
router.post('/', controller.create);

// 👇 આ લાઈન ખાસ હોવી જોઈએ! (જો અહીં exports.list લખ્યું હોય તો ભૂલ છે)
module.exports = router;
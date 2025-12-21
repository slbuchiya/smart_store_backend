const express = require('express');
const router = express.Router();
// 👇 આ પાથ સાચો હોવો જોઈએ અને સ્પેલિંગ મિસ્ટેક ન હોવી જોઈએ
const controller = require('../controllers/receiptController');
const auth = require('../middleware/auth');

router.use(auth);

// 👇 જો controller.list undefined હોય તો જ એરર આવે
router.get('/', controller.list);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', controller.list);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

// 👇 આ લાઈન ખાસ હોવી જોઈએ!
module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/saleController');
const auth = require('../middleware/auth');

router.use(auth);

// List Sales
router.get('/', controller.list);

// Create Sale
router.post('/', controller.create);

// ✅ NEW: Update Sale Route
router.put('/:id', controller.update);

// Delete Sale Route
router.delete('/:id', controller.remove);

module.exports = router;
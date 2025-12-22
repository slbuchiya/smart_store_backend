const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseController');
const auth = require('../middleware/auth');

router.use(auth);

// List
router.get('/', controller.list);

// Create
router.post('/', controller.create);

// ✅ NEW: Delete Route
router.delete('/:id', controller.remove);

module.exports = router;
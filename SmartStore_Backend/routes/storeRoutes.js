const express = require('express');
const router = express.Router();
const controller = require('../controllers/storeController');
const auth = require('../middleware/auth');

// ✅ 1. Get Store Profile (આ નવી લાઈન ઉમેરી છે)
// આનાથી Dashboard અને Settings પેજ પર રિફ્રેશ કર્યા પછી પણ Plan Type દેખાશે.
router.get('/profile', auth, controller.getProfile);

// 2. Profile update for Store Owner
router.put('/profile', auth, controller.updateProfile);

// Admin Routes (Add middleware to check if user is admin if needed)
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:storeId', controller.update);
router.delete('/:storeId', controller.remove);

module.exports = router;
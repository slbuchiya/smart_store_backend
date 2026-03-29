const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseController');
const auth = require('../middleware/auth');

router.use(auth);

// List
router.get('/', controller.list);

// Create
router.post('/', controller.create);

//  Update Route 
router.put('/:id', controller.update);

//  Delete Route
router.delete('/:id', controller.remove);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.use(auth); // Protect routes

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
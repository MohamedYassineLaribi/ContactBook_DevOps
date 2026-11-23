const express = require('express');
const c = require('../controllers/contactController');

const router = express.Router();

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getFarms, addFarm } = require('../controllers/farmsController');

router.get('/', getFarms);
router.post('/', addFarm);

module.exports = router;
// backend/routes/recommendation.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET recommended products for a user
router.get('/:userId', recommendationController.getRecommendations);

module.exports = router;
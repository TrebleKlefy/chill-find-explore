const express = require('express');
const router = express.Router();
const {
  getMoodBasedRecommendations,
  getTrendingPlaces,
  getLocationSuggestions
} = require('../controllers/discoveryController');

// Public routes
router.get('/mood-based', getMoodBasedRecommendations);
router.get('/trending', getTrendingPlaces);
router.get('/location-suggestions', getLocationSuggestions);

module.exports = router;
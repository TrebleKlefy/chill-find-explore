const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNearbyRestaurants,
  submitRestaurant,
  getRestaurantDetails,
  updateRestaurant,
  addReview,
  searchRestaurants
} = require('../controllers/restaurantController');

// Get nearby restaurants
router.get('/nearby', getNearbyRestaurants);

// Search restaurants
router.get('/search', searchRestaurants);

// Submit new restaurant
router.post('/', auth, submitRestaurant);

// Get restaurant details
router.get('/:id', getRestaurantDetails);

// Update restaurant
router.patch('/:id', auth, updateRestaurant);

// Add review
router.post('/:id/reviews', auth, addReview);

module.exports = router; 
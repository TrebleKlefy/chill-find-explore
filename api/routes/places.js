const express = require('express');
const router = express.Router();
const {
  getNearbyPlaces,
  submitPlace,
  getPlaceDetails,
  updateRating,
  searchPlaces
} = require('../controllers/placesController');

// Test endpoint for debugging
router.get('/test', async (req, res) => {
  try {
    const supabase = require('../config/supabase');
    const { data, error } = await supabase
      .from('places')
      .select('id, name, category')
      .limit(5);
    
    if (error) {
      console.error('Test endpoint error:', error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
    
    res.json({ message: 'Success', count: data.length, places: data });
  } catch (err) {
    console.error('Test endpoint catch:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get nearby places with filters
router.get('/nearby', getNearbyPlaces);

// Search places by text
router.get('/search', searchPlaces);

// Submit a new place
router.post('/', submitPlace);

// Get place details
router.get('/:id', getPlaceDetails);

// Update place rating
router.post('/:id/rate', updateRating);

module.exports = router;

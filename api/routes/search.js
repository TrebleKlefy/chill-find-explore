const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  search,
  getSuggestions
} = require('../controllers/searchController');

// Public routes
router.get('/', search);
router.get('/suggestions', getSuggestions);

module.exports = router;
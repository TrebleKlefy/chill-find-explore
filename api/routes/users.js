const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  savePlace,
  removeSavedPlace
} = require('../controllers/userController');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

// Saved places routes
router.post('/places/:placeId/save', auth, savePlace);
router.delete('/places/:placeId/save', auth, removeSavedPlace);

module.exports = router; 
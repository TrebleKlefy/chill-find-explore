const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  logout,
  refreshToken,
  getCurrentUser
} = require('../controllers/authController');

// Auth routes
router.post('/logout', auth, logout);
router.post('/refresh', refreshToken);
router.get('/me', auth, getCurrentUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  suspendUser,
  activateUser,
  promoteUser,
  deleteUser,
  getContentForModeration,
  reviewContent,
  bulkReviewContent,
  getAnalytics,
  getSettings,
  updateSettings
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// User management
router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserById);
router.put('/users/:id', adminAuth, updateUser);
router.post('/users/:id/suspend', adminAuth, suspendUser);
router.post('/users/:id/activate', adminAuth, activateUser);
router.post('/users/:id/promote', adminAuth, promoteUser);
router.delete('/users/:id', adminAuth, deleteUser);

// Content moderation
router.get('/content', adminAuth, getContentForModeration);
router.post('/content/:id/review', adminAuth, reviewContent);
router.post('/content/bulk-review', adminAuth, bulkReviewContent);

// Analytics
router.get('/analytics/users', adminAuth, getAnalytics.users);
router.get('/analytics/content', adminAuth, getAnalytics.content);

// Settings
router.get('/settings', adminAuth, getSettings);
router.put('/settings', adminAuth, updateSettings);

module.exports = router;
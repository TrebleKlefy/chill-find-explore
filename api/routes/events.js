const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNearbyEvents,
  submitEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  getEventsByDateRange
} = require('../controllers/eventController');

// Get nearby events
router.get('/nearby', getNearbyEvents);

// Get events by date range
router.get('/date-range', getEventsByDateRange);

// Submit new event
router.post('/', auth, submitEvent);

// Get event details
router.get('/:id', getEventDetails);

// Update event
router.patch('/:id', auth, updateEvent);

// Delete event
router.delete('/:id', auth, deleteEvent);

module.exports = router; 
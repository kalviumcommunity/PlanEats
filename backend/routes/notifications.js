const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  getUserNotifications,
  markAsRead,
  deleteNotification,
  deleteOldNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', getUserNotifications);

// @route   PUT /api/notifications/read
// @desc    Mark notifications as read
// @access  Private
router.put('/read', markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', deleteNotification);

// @route   DELETE /api/notifications
// @desc    Delete old notifications
// @access  Private
router.delete('/', deleteOldNotifications);

module.exports = router;
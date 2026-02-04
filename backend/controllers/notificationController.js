const Notification = require('../models/Notification');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { read, page = 1, limit = 10 } = req.query;
    
    const filter = { user: req.user._id };
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(filter);
    
    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve notifications'
    });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    let result;
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      result = await Notification.markAsRead(req.user._id, notificationIds);
    } else {
      // Mark all unread notifications as read
      result = await Notification.markAsRead(req.user._id);
    }
    
    res.json({
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to mark notifications as read'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete notification'
    });
  }
};

// Delete old notifications
const deleteOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await Notification.deleteOldNotifications(parseInt(days));
    
    res.json({
      message: `Deleted ${result.deletedCount} old notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete old notifications error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete old notifications'
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  deleteOldNotifications
};
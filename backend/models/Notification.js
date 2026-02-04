const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'meal-reminder', 'plan-update'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['recipe', 'mealplan', 'user', 'system']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String
}, {
  timestamps: true
});

// Index for performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function(userId) {
  return this.find({ user: userId, read: false })
    .sort({ createdAt: -1 });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = { user: userId };
  
  if (notificationIds) { 
    query._id = { $in: notificationIds };
  } else {
    query.read = false;
  }
  
  return this.updateMany(query, { $set: { read: true } });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({ 
    createdAt: { $lt: cutoffDate },
    read: true 
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
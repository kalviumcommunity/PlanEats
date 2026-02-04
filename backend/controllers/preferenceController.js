const Preference = require('../models/Preference');
const User = require('../models/User');

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    let preferences = await Preference.findOne({ user: req.user._id });
    
    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = new Preference({ user: req.user._id });
      await preferences.save();
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve preferences'
    });
  }
};

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.user;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    let preferences = await Preference.findOne({ user: req.user._id });
    
    // If no preferences exist, create new ones
    if (!preferences) {
      preferences = new Preference({ user: req.user._id, ...updates });
    } else {
      // Update existing preferences
      Object.keys(updates).forEach(key => {
        preferences[key] = updates[key];
      });
    }
    
    await preferences.save();
    
    res.json(preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update preferences'
    });
  }
};

// Reset preferences to default
const resetPreferences = async (req, res) => {
  try {
    const preferences = await Preference.findOne({ user: req.user._id });
    
    if (preferences) {
      // Reset to default values (keeping the user reference)
      const userRef = preferences.user;
      preferences.remove();
      
      const newPreferences = new Preference({ user: userRef });
      await newPreferences.save();
      
      res.json(newPreferences);
    } else {
      // Create new default preferences
      const newPreferences = new Preference({ user: req.user._id });
      await newPreferences.save();
      
      res.json(newPreferences);
    }
  } catch (error) {
    console.error('Reset preferences error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reset preferences'
    });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  resetPreferences
};
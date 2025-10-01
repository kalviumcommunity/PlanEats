const express = require('express');
const User = require('../models/User');
const { auth, validateObjectId } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes', 'title images nutrition')
      .populate('mealPlans', 'title startDate endDate status')
      .select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching user profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      profile,
      dietaryPreferences,
      allergies,
      favoriteIngredients,
      dislikedIngredients,
      nutritionGoals,
      preferences
    } = req.body;

    const updateData = {};
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (dietaryPreferences) updateData.dietaryPreferences = dietaryPreferences;
    if (allergies) updateData.allergies = allergies;
    if (favoriteIngredients) updateData.favoriteIngredients = favoriteIngredients;
    if (dislikedIngredients) updateData.dislikedIngredients = dislikedIngredients;
    if (nutritionGoals) updateData.nutritionGoals = { ...req.user.nutritionGoals, ...nutritionGoals };
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes', 'title images nutrition')
      .populate('mealPlans', 'title startDate endDate status progress')
      .select('-password');

    // Get recent meal plans
    const recentMealPlans = user.mealPlans
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Get favorite recipes
    const favoriteRecipes = user.savedRecipes.slice(0, 6);

    // Calculate dashboard stats
    const stats = {
      totalMealPlans: user.mealPlans.length,
      activeMealPlans: user.mealPlans.filter(plan => plan.status === 'active').length,
      savedRecipes: user.savedRecipes.length,
      completedMealPlans: user.mealPlans.filter(plan => plan.status === 'completed').length
    };

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        dietaryPreferences: user.dietaryPreferences,
        preferences: user.preferences
      },
      stats,
      recentMealPlans,
      favoriteRecipes
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while fetching dashboard data'
    });
  }
});

module.exports = router;
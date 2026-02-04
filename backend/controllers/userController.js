const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration } = require('../config/jwt');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiration });
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email or username already exists'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to register user'
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'No user found with this email or username'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      preferences: user.preferences,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to login'
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes')
      .populate('mealPlans');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve user profile'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'profile', 'dietaryPreferences', 'allergies', 
      'favoriteIngredients', 'dislikedIngredients', 
      'nutritionGoals', 'preferences'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        error: 'Invalid updates',
        message: 'One or more update fields are not allowed'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update user profile'
    });
  }
};

// Save recipe to user's favorites
const saveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Check if recipe is already saved
    if (user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({
        error: 'Already saved',
        message: 'Recipe is already in your saved recipes'
      });
    }

    user.savedRecipes.push(recipeId);
    await user.save();

    res.json({
      message: 'Recipe saved successfully',
      savedRecipes: user.savedRecipes
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to save recipe'
    });
  }
};

// Remove recipe from user's favorites
const unsaveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Check if recipe is saved
    if (!user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({
        error: 'Not saved',
        message: 'Recipe is not in your saved recipes'
      });
    }

    user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
    await user.save();

    res.json({
      message: 'Recipe removed successfully',
      savedRecipes: user.savedRecipes
    });
  } catch (error) {
    console.error('Unsave recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to remove recipe'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  saveRecipe,
  unsaveRecipe
};
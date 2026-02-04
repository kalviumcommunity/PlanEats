const express = require('express');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation'); // Use the validate function from validation middleware
const {
  getUserPreferences,
  updateUserPreferences,
  resetPreferences
} = require('../controllers/preferenceController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const preferenceValidation = [
  body('dietaryPreferences').optional().isArray(),
  body('allergies').optional().isArray(),
  body('favoriteIngredients').optional().isArray(),
  body('dislikedIngredients').optional().isArray(),
  body('cuisinePreferences').optional().isArray(),
  body('dailyCalories').optional().isInt({ min: 800, max: 5000 }),
  body('uiPreferences.theme').optional().isIn(['light', 'dark', 'auto'])
];

// @route   GET /api/preferences
// @desc    Get user preferences
// @access  Private
router.get('/', getUserPreferences);

// @route   PUT /api/preferences
// @desc    Update user preferences
// @access  Private
router.put('/', preferenceValidation, validate, updateUserPreferences);

// @route   POST /api/preferences/reset
// @desc    Reset preferences to default
// @access  Private
router.post('/reset', resetPreferences);

module.exports = router;
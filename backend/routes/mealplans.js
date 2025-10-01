const express = require('express');
const { body, validationResult } = require('express-validator');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { auth, validateObjectId } = require('../middleware/auth');
const { generateMealPlanWithAI } = require('../utils/aiService');

const router = express.Router();

// Validation rules
const createMealPlanValidation = [
  body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('duration').isInt({ min: 1, max: 365 }).withMessage('Duration must be between 1 and 365 days')
];

const aiMealPlanValidation = [
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('duration').isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1 and 30 days')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// @route   GET /api/mealplans
// @desc    Get user's meal plans
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const options = { status: status || null, limit: limitNum, skip };
    const mealPlans = await MealPlan.findByUser(req.user._id, options);
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    const total = await MealPlan.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      mealPlans,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMealPlans: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({
      error: 'Failed to fetch meal plans',
      message: 'An error occurred while fetching meal plans'
    });
  }
});

// @route   GET /api/mealplans/:id
// @desc    Get single meal plan by ID
// @access  Private
router.get('/:id', auth, validateObjectId(), async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('meals.breakfast.recipe', 'title images nutrition prepTime cookTime')
      .populate('meals.lunch.recipe', 'title images nutrition prepTime cookTime')
      .populate('meals.dinner.recipe', 'title images nutrition prepTime cookTime')
      .populate('meals.snacks.recipe', 'title images nutrition prepTime cookTime');

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan does not exist'
      });
    }

    if (mealPlan.user._id.toString() !== req.user._id.toString() && !mealPlan.isPublic) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own meal plans'
      });
    }

    res.json({ mealPlan });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({
      error: 'Failed to fetch meal plan',
      message: 'An error occurred while fetching the meal plan'
    });
  }
});

// @route   POST /api/mealplans
// @desc    Create a new meal plan manually
// @access  Private
router.post('/', auth, createMealPlanValidation, handleValidationErrors, async (req, res) => {
  try {
    const mealPlanData = { ...req.body, user: req.user._id };

    // Calculate duration if not provided
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (!mealPlanData.duration) {
      mealPlanData.duration = diffDays;
    }

    // Initialize empty meals for each day
    mealPlanData.meals = [];
    for (let i = 0; i < mealPlanData.duration; i++) {
      const mealDate = new Date(startDate);
      mealDate.setDate(mealDate.getDate() + i);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      mealPlanData.meals.push({
        day: i + 1,
        date: mealDate,
        dayName: dayNames[mealDate.getDay()],
        breakfast: {},
        lunch: {},
        dinner: {},
        snacks: []
      });
    }

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('user', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan: populatedMealPlan
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({
      error: 'Failed to create meal plan',
      message: 'An error occurred while creating the meal plan'
    });
  }
});

// @route   POST /api/mealplans/generate
// @desc    Generate AI-powered meal plan
// @access  Private
router.post('/generate', auth, aiMealPlanValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      ingredients,
      duration,
      dietaryPreferences = [],
      allergies = [],
      goals = ['maintenance'],
      excludeIngredients = [],
      cuisinePreferences = [],
      cookingTime = 'moderate',
      mealTypes = ['breakfast', 'lunch', 'dinner'],
      servings = 1
    } = req.body;

    // Get user preferences
    const user = await User.findById(req.user._id);
    const userDietaryPreferences = [...new Set([...dietaryPreferences, ...user.dietaryPreferences])];
    const userAllergies = [...new Set([...allergies, ...user.allergies])];
    const userExcludeIngredients = [...new Set([...excludeIngredients, ...user.dislikedIngredients])];

    // Create AI prompt parameters
    const aiParams = {
      ingredients,
      duration,
      dietaryPreferences: userDietaryPreferences,
      allergies: userAllergies,
      goals,
      excludeIngredients: userExcludeIngredients,
      favoriteIngredients: user.favoriteIngredients,
      cuisinePreferences,
      cookingTime,
      mealTypes,
      servings,
      nutritionGoals: user.nutritionGoals
    };

    // Generate meal plan using AI
    const aiResponse = await generateMealPlanWithAI(aiParams);
    
    if (!aiResponse.success) {
      return res.status(500).json({
        error: 'AI generation failed',
        message: aiResponse.error || 'Failed to generate meal plan with AI'
      });
    }

    // Create meal plan from AI response
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration - 1);

    const mealPlanData = {
      title: aiResponse.title || `AI Meal Plan - ${new Date().toLocaleDateString()}`,
      description: aiResponse.description || 'AI-generated meal plan based on your ingredients and preferences',
      user: req.user._id,
      startDate,
      endDate,
      duration,
      goals,
      dietaryRestrictions: userDietaryPreferences,
      allergies: userAllergies,
      preferredIngredients: ingredients,
      avoidedIngredients: userExcludeIngredients,
      meals: aiResponse.meals || [],
      aiGenerated: true,
      aiPrompt: JSON.stringify(aiParams),
      aiModel: aiResponse.model || 'unknown',
      generationMetadata: {
        ingredientsUsed: ingredients,
        cuisinePreferences,
        excludedIngredients: userExcludeIngredients,
        nutritionalFocus: goals.join(', '),
        timestamp: new Date()
      },
      status: 'active'
    };

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('user', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'AI meal plan generated successfully',
      mealPlan: populatedMealPlan,
      aiMetadata: {
        model: aiResponse.model,
        generatedAt: new Date(),
        prompt: aiParams
      }
    });
  } catch (error) {
    console.error('Generate AI meal plan error:', error);
    res.status(500).json({
      error: 'Failed to generate meal plan',
      message: 'An error occurred while generating the AI meal plan'
    });
  }
});

// @route   PUT /api/mealplans/:id
// @desc    Update a meal plan
// @access  Private
router.put('/:id', auth, validateObjectId(), async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan does not exist'
      });
    }

    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own meal plans'
      });
    }

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username profile.firstName profile.lastName');

    res.json({
      message: 'Meal plan updated successfully',
      mealPlan: updatedMealPlan
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({
      error: 'Failed to update meal plan',
      message: 'An error occurred while updating the meal plan'
    });
  }
});

// @route   DELETE /api/mealplans/:id
// @desc    Delete a meal plan
// @access  Private
router.delete('/:id', auth, validateObjectId(), async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan does not exist'
      });
    }

    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own meal plans'
      });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({
      error: 'Failed to delete meal plan',
      message: 'An error occurred while deleting the meal plan'
    });
  }
});

module.exports = router;
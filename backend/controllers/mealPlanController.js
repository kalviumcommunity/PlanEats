const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { generateMealPlanWithAI } = require('../utils/aiService');

// Create a new meal plan
const createMealPlan = async (req, res) => {
  try {
    const mealPlanData = {
      ...req.body,
      user: req.user._id
    };

    // Validate dates
    const startDate = new Date(mealPlanData.startDate);
    const endDate = new Date(mealPlanData.endDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'End date must be after start date'
      });
    }

    // Calculate duration
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    mealPlanData.duration = duration;

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create meal plan'
    });
  }
};

// Generate AI meal plan
const generateAIPlan = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      goals = ['maintenance'],
      dietaryRestrictions = [],
      allergies = [],
      preferredIngredients = [],
      avoidedIngredients = [],
      targetNutrition = {}
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'End date must be after start date'
      });
    }

    // Calculate duration
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Generate meal plan using AI service
    const aiPlan = await generateMealPlanWithAI({
      startDate: start,
      endDate: end,
      duration,
      goals,
      dietaryRestrictions,
      allergies,
      preferredIngredients,
      avoidedIngredients,
      targetNutrition,
      userId: req.user._id
    });

    // Save the generated plan
    const mealPlanData = {
      ...aiPlan,
      user: req.user._id,
      aiGenerated: true,
      status: 'draft'
    };

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Generate AI meal plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to generate AI meal plan'
    });
  }
};

// Get all meal plans for a user
const getUserMealPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const mealPlans = await MealPlan.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MealPlan.countDocuments(filter);

    res.json({
      mealPlans,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get user meal plans error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve meal plans'
    });
  }
};

// Get a single meal plan by ID
const getMealPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'Meal plan not found'
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this meal plan'
      });
    }

    res.json(mealPlan);
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve meal plan'
    });
  }
};

// Update a meal plan
const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'Meal plan not found'
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own meal plans'
      });
    }

    // Prevent updating certain fields
    delete updates.user;
    delete updates.aiGenerated;
    delete updates.aiPrompt;
    delete updates.aiModel;

    Object.keys(updates).forEach(key => {
      mealPlan[key] = updates[key];
    });

    await mealPlan.save();

    res.json(mealPlan);
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update meal plan'
    });
  }
};

// Delete a meal plan
const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'Meal plan not found'
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own meal plans'
      });
    }

    await mealPlan.remove();

    res.json({
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete meal plan'
    });
  }
};

// Update meal completion status
const updateMealCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayIndex, mealType, completed, rating } = req.body;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'Meal plan not found'
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this meal plan'
      });
    }

    // Update meal completion
    await mealPlan.updateMealCompletion(dayIndex, mealType, completed, rating);

    res.json(mealPlan);
  } catch (error) {
    console.error('Update meal completion error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update meal completion'
    });
  }
};

// Generate shopping list for a meal plan
const generateShoppingList = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'Meal plan not found'
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this meal plan'
      });
    }

    // Generate shopping list
    await mealPlan.generateShoppingList();

    res.json(mealPlan);
  } catch (error) {
    console.error('Generate shopping list error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to generate shopping list'
    });
  }
};

module.exports = {
  createMealPlan,
  generateAIPlan,
  getUserMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  updateMealCompletion,
  generateShoppingList
};
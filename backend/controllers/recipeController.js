const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      author: req.user._id,
      source: 'user-created'
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    // Populate author info
    await recipe.populate('author', 'username profile.firstName profile.lastName');

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create recipe'
    });
  }
};

// Get all recipes with filtering and pagination
const getRecipes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      dietaryTags,
      mealType,
      cuisine,
      difficulty,
      maxPrepTime,
      maxCookTime,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = { isPublic: true };

    // Apply filters
    if (search) {
      filter.$text = { $search: search };
    }

    if (dietaryTags) {
      filter.dietaryTags = { $in: dietaryTags.split(',') };
    }

    if (mealType) {
      filter.mealType = { $in: mealType.split(',') };
    }

    if (cuisine) {
      filter.cuisine = { $in: cuisine.split(',') };
    }

    if (difficulty) {
      filter.difficulty = { $in: difficulty.split(',') };
    }

    if (maxPrepTime) {
      filter.prepTime = { $lte: parseInt(maxPrepTime) };
    }

    if (maxCookTime) {
      filter.cookTime = { $lte: parseInt(maxCookTime) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    const recipes = await Recipe.find(filter)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments(filter);

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve recipes'
    });
  }
};

// Get a single recipe by ID
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('reviews.user', 'username profile.firstName profile.lastName');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'Recipe not found'
      });
    }

    // Increment view count
    await recipe.incrementViews();

    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve recipe'
    });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.author;
    delete updates.source;
    delete updates.views;
    delete updates.favorites;
    delete updates.rating;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'Recipe not found'
      });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own recipes'
      });
    }

    Object.keys(updates).forEach(key => {
      recipe[key] = updates[key];
    });

    await recipe.save();
    await recipe.populate('author', 'username profile.firstName profile.lastName');

    res.json(recipe);
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update recipe'
    });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'Recipe not found'
      });
    }

    // Check if user is the author or admin
    if (recipe.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own recipes'
      });
    }

    await recipe.remove();

    res.json({
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete recipe'
    });
  }
};

// Add a review to a recipe
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'Recipe not found'
      });
    }

    // Add review
    await recipe.addReview(req.user._id, rating, comment);

    // Repopulate reviews
    await recipe.populate('reviews.user', 'username profile.firstName profile.lastName');

    res.json(recipe);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to add review'
    });
  }
};

// Get user's recipes
const getUserRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments({ author: req.user._id });

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve your recipes'
    });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addReview,
  getUserRecipes
};
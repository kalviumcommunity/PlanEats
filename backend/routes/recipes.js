const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { auth, optionalAuth, validateObjectId } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createRecipeValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
  body('servings')
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('prepTime')
    .isInt({ min: 0 })
    .withMessage('Prep time must be a positive number'),
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cook time must be a positive number'),
  body('mealType')
    .isArray({ min: 1 })
    .withMessage('At least one meal type is required')
];

const updateRecipeValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('prepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Prep time must be a positive number'),
  body('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cook time must be a positive number')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
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

// @route   GET /api/recipes
// @desc    Get recipes with filtering and search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      ingredients,
      dietaryTags,
      mealType,
      cuisine,
      difficulty,
      maxPrepTime,
      maxCookTime,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let recipes;
    let total;

    const options = {
      dietaryTags: dietaryTags ? dietaryTags.split(',') : [],
      mealType: mealType ? mealType.split(',') : [],
      cuisine: cuisine ? cuisine.split(',') : [],
      difficulty: difficulty ? difficulty.split(',') : [],
      maxPrepTime: maxPrepTime ? parseInt(maxPrepTime) : null,
      maxCookTime: maxCookTime ? parseInt(maxCookTime) : null,
      limit: limitNum,
      skip,
      sortBy
    };

    if (search) {
      // Text search
      recipes = await Recipe.searchRecipes(search, options);
      total = await Recipe.countDocuments({
        $text: { $search: search },
        isPublic: true
      });
    } else if (ingredients) {
      // Ingredient-based search
      const ingredientList = ingredients.split(',').map(ing => ing.trim());
      recipes = await Recipe.findByIngredients(ingredientList, options);
      total = await Recipe.countDocuments({
        'ingredients.name': { $in: ingredientList.map(ing => new RegExp(ing, 'i')) },
        isPublic: true
      });
    } else {
      // General listing
      const query = { isPublic: true };
      
      if (options.dietaryTags.length > 0) {
        query.dietaryTags = { $in: options.dietaryTags };
      }
      if (options.mealType.length > 0) {
        query.mealType = { $in: options.mealType };
      }
      if (options.cuisine.length > 0) {
        query.cuisine = { $in: options.cuisine };
      }
      if (options.difficulty.length > 0) {
        query.difficulty = { $in: options.difficulty };
      }
      if (options.maxPrepTime) {
        query.prepTime = { $lte: options.maxPrepTime };
      }
      if (options.maxCookTime) {
        query.cookTime = { $lte: options.maxCookTime };
      }

      let sort = {};
      switch (sortBy) {
        case 'rating':
          sort = { 'rating.average': -1, favorites: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        case 'prepTime':
          sort = { prepTime: 1 };
          break;
        case 'totalTime':
          sort = { prepTime: 1, cookTime: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      recipes = await Recipe.find(query)
        .populate('author', 'username profile.firstName profile.lastName')
        .sort(sort)
        .limit(limitNum)
        .skip(skip);
      
      total = await Recipe.countDocuments(query);
    }

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      recipes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecipes: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        search,
        ingredients,
        dietaryTags: options.dietaryTags,
        mealType: options.mealType,
        cuisine: options.cuisine,
        difficulty: options.difficulty,
        maxPrepTime: options.maxPrepTime,
        maxCookTime: options.maxCookTime,
        sortBy
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      error: 'Failed to fetch recipes',
      message: 'An error occurred while fetching recipes'
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Public
router.get('/:id', validateObjectId(), optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('reviews.user', 'username profile.firstName profile.lastName');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe does not exist'
      });
    }

    if (!recipe.isPublic && (!req.user || recipe.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This recipe is private'
      });
    }

    // Increment view count
    await recipe.incrementViews();

    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      error: 'Failed to fetch recipe',
      message: 'An error occurred while fetching the recipe'
    });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth, createRecipeValidation, handleValidationErrors, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      author: req.user._id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: populatedRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      error: 'Failed to create recipe',
      message: 'An error occurred while creating the recipe'
    });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (Recipe author only)
router.put('/:id', auth, validateObjectId(), updateRecipeValidation, handleValidationErrors, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe does not exist'
      });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own recipes'
      });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username profile.firstName profile.lastName');

    res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      error: 'Failed to update recipe',
      message: 'An error occurred while updating the recipe'
    });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (Recipe author only)
router.delete('/:id', auth, validateObjectId(), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe does not exist'
      });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own recipes'
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      error: 'Failed to delete recipe',
      message: 'An error occurred while deleting the recipe'
    });
  }
});

// @route   POST /api/recipes/:id/reviews
// @desc    Add a review to a recipe
// @access  Private
router.post('/:id/reviews', auth, validateObjectId(), reviewValidation, handleValidationErrors, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe does not exist'
      });
    }

    // Check if recipe is public
    if (!recipe.isPublic) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Cannot review a private recipe'
      });
    }

    // Add review
    await recipe.addReview(req.user._id, rating, comment);

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('reviews.user', 'username profile.firstName profile.lastName');

    res.json({
      message: 'Review added successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      error: 'Failed to add review',
      message: 'An error occurred while adding the review'
    });
  }
});

// @route   POST /api/recipes/:id/favorite
// @desc    Toggle favorite status for a recipe
// @access  Private
router.post('/:id/favorite', auth, validateObjectId(), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe does not exist'
      });
    }

    const user = await User.findById(req.user._id);
    const recipeIndex = user.savedRecipes.indexOf(req.params.id);
    
    let isFavorited;
    if (recipeIndex === -1) {
      // Add to favorites
      user.savedRecipes.push(req.params.id);
      recipe.favorites += 1;
      isFavorited = true;
    } else {
      // Remove from favorites
      user.savedRecipes.splice(recipeIndex, 1);
      recipe.favorites = Math.max(0, recipe.favorites - 1);
      isFavorited = false;
    }

    await Promise.all([user.save(), recipe.save()]);

    res.json({
      message: isFavorited ? 'Recipe added to favorites' : 'Recipe removed from favorites',
      isFavorited,
      favoriteCount: recipe.favorites
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      error: 'Failed to update favorite status',
      message: 'An error occurred while updating favorite status'
    });
  }
});

// @route   GET /api/recipes/my/created
// @desc    Get user's created recipes
// @access  Private
router.get('/my/created', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { author: req.user._id };
    if (status !== 'all') {
      query.isPublic = status === 'public';
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      recipes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecipes: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      error: 'Failed to fetch your recipes',
      message: 'An error occurred while fetching your recipes'
    });
  }
});

// @route   GET /api/recipes/my/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/my/favorites', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'author',
          select: 'username profile.firstName profile.lastName'
        },
        options: {
          sort: { createdAt: -1 },
          limit: limitNum,
          skip
        }
      });

    const totalFavorites = user.savedRecipes.length;
    const totalPages = Math.ceil(totalFavorites / limitNum);

    res.json({
      recipes: user.savedRecipes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecipes: totalFavorites,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get favorite recipes error:', error);
    res.status(500).json({
      error: 'Failed to fetch favorite recipes',
      message: 'An error occurred while fetching favorite recipes'
    });
  }
});

// @route   GET /api/recipes/categories
// @desc    Get recipe categories and tags for filtering
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const cuisines = await Recipe.distinct('cuisine');
    const dietaryTags = await Recipe.distinct('dietaryTags');
    const mealTypes = await Recipe.distinct('mealType');
    const difficulties = await Recipe.distinct('difficulty');
    const allergens = await Recipe.distinct('allergens');

    res.json({
      cuisines: cuisines.filter(Boolean),
      dietaryTags: dietaryTags.filter(Boolean),
      mealTypes: mealTypes.filter(Boolean),
      difficulties: difficulties.filter(Boolean),
      allergens: allergens.filter(Boolean)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'An error occurred while fetching recipe categories'
    });
  }
});

module.exports = router;
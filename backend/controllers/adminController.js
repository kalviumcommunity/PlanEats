const User = require('../models/User');
const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRecipes,
      verifiedRecipes,
      pendingRecipes,
      totalMealPlans,
      newUsersLast7Days,
      newUsersLast30Days
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Recipe.countDocuments(),
      Recipe.countDocuments({ isVerified: true }),
      Recipe.countDocuments({ isVerified: false }),
      MealPlan.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newLast7Days: newUsersLast7Days,
        newLast30Days: newUsersLast30Days
      },
      recipes: {
        total: totalRecipes,
        verified: verifiedRecipes,
        pending: pendingRecipes
      },
      mealPlans: {
        total: totalMealPlans
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: order })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > page * limit,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('savedRecipes', 'title images createdAt')
      .populate('mealPlans', 'title startDate endDate status');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
};

// @desc    Update user (role, status, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { isAdmin, role, isActive } = req.body;

    const updateData = {};
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Optionally delete user's recipes and meal plans
    await Promise.all([
      Recipe.deleteMany({ author: req.params.id }),
      MealPlan.deleteMany({ user: req.params.id })
    ]);

    res.json({
      message: 'User and associated content deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

// @desc    Get recipes pending verification
// @route   GET /api/admin/recipes/pending
// @access  Private/Admin
exports.getPendingRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const recipes = await Recipe.find({ isVerified: false })
      .populate('author', 'username email profile')
      .sort({ createdAt: 'desc' })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Recipe.countDocuments({ isVerified: false });

    res.json({
      recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count
      }
    });
  } catch (error) {
    console.error('Get pending recipes error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending recipes',
      message: error.message
    });
  }
};

// @desc    Verify or reject recipe
// @route   PUT /api/admin/recipes/:id/verify
// @access  Private/Admin
exports.verifyRecipe = async (req, res) => {
  try {
    const { isVerified, rejectionReason } = req.body;

    const updateData = {
      isVerified: isVerified || false,
      ...(rejectionReason && { rejectionReason })
    };

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The specified recipe does not exist'
      });
    }

    res.json({
      message: `Recipe ${isVerified ? 'verified' : 'rejected'} successfully`,
      recipe
    });
  } catch (error) {
    console.error('Verify recipe error:', error);
    res.status(500).json({
      error: 'Failed to verify recipe',
      message: error.message
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Most popular recipes (by views/favorites)
    const popularRecipes = await Recipe.find()
      .sort({ views: -1, favorites: -1 })
      .limit(10)
      .populate('author', 'username');

    // Recipe categories distribution
    const cuisineDistribution = await Recipe.aggregate([
      {
        $group: {
          _id: '$cuisine',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Dietary tags distribution
    const dietaryTagsDistribution = await Recipe.aggregate([
      { $unwind: '$dietaryTags' },
      {
        $group: {
          _id: '$dietaryTags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      userGrowth,
      popularRecipes,
      cuisineDistribution,
      dietaryTagsDistribution,
      period: days
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};
// @desc    Get all recipes with pagination and filters
// @route   GET /api/admin/recipes
// @access  Private/Admin
exports.getAllRecipes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      cuisine = '',
      difficulty = '',
      isVerified = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine) {
      query.cuisine = cuisine;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (isVerified !== '') {
      query.isVerified = isVerified === 'true';
    }

    // Execute query with pagination
    const recipes = await Recipe.find(query)
      .populate('author', 'username email')
      .sort({ [sortBy]: order })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Recipe.countDocuments(query);

    res.json({
      recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > page * limit,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all recipes admin error:', error);
    res.status(500).json({
      error: 'Failed to fetch recipes',
      message: error.message
    });
  }
};

// @desc    Update any recipe (Admin only)
// @route   PUT /api/admin/recipes/:id
// @access  Private/Admin
exports.updateRecipe = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.author;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The specified recipe does not exist'
      });
    }

    res.json({
      message: 'Recipe updated successfully by admin',
      recipe
    });
  } catch (error) {
    console.error('Admin update recipe error:', error);
    res.status(500).json({
      error: 'Failed to update recipe',
      message: error.message
    });
  }
};

// @desc    Delete any recipe (Admin only)
// @route   DELETE /api/admin/recipes/:id
// @access  Private/Admin
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The specified recipe does not exist'
      });
    }

    res.json({
      message: 'Recipe deleted successfully by admin'
    });
  } catch (error) {
    console.error('Admin delete recipe error:', error);
    res.status(500).json({
      error: 'Failed to delete recipe',
      message: error.message
    });
  }
};

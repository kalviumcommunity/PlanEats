const express = require('express');
const { adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingRecipes,
  verifyRecipe,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
  getAnalytics
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Recipe moderation & management routes
router.get('/recipes', getAllRecipes);
router.get('/recipes/pending', getPendingRecipes);
router.put('/recipes/:id/verify', verifyRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

module.exports = router;

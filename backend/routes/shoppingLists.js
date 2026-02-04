const express = require('express');
const { auth, validateObjectId } = require('../middleware/auth');
const { 
  createShoppingList,
  getUserShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  markItemAsPurchased
} = require('../controllers/shoppingListController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/shopping-lists
// @desc    Create a new shopping list
// @access  Private
router.post('/', createShoppingList);

// @route   GET /api/shopping-lists
// @desc    Get user shopping lists
// @access  Private
router.get('/', getUserShoppingLists);

// @route   GET /api/shopping-lists/:id
// @desc    Get a specific shopping list
// @access  Private
router.get('/:id', validateObjectId('id'), getShoppingListById);

// @route   PUT /api/shopping-lists/:id
// @desc    Update a shopping list
// @access  Private
router.put('/:id', validateObjectId('id'), updateShoppingList);

// @route   DELETE /api/shopping-lists/:id
// @desc    Delete a shopping list
// @access  Private
router.delete('/:id', validateObjectId('id'), deleteShoppingList);

// @route   POST /api/shopping-lists/:id/items
// @desc    Add item to shopping list
// @access  Private
router.post('/:id/items', validateObjectId('id'), addItemToList);

// @route   PUT /api/shopping-lists/:id/items/:itemId
// @desc    Mark item as purchased
// @access  Private
router.put('/:id/items/:itemId', validateObjectId('id'), markItemAsPurchased);

module.exports = router;
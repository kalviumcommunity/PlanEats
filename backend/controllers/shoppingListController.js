const ShoppingList = require('../models/ShoppingList');

// Create a new shopping list
const createShoppingList = async (req, res) => {
  try {
    const { name, items = [], budget, stores } = req.body;
    
    const shoppingList = new ShoppingList({
      user: req.user._id,
      name,
      items,
      budget,
      stores
    });
    
    await shoppingList.save();
    
    res.status(201).json(shoppingList);
  } catch (error) {
    console.error('Create shopping list error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create shopping list'
    });
  }
};

// Get user shopping lists
const getUserShoppingLists = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const shoppingLists = await ShoppingList.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ShoppingList.countDocuments(filter);
    
    res.json({
      shoppingLists,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get shopping lists error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve shopping lists'
    });
  }
};

// Get a specific shopping list
const getShoppingListById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shoppingList = await ShoppingList.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({
        error: 'Shopping list not found',
        message: 'Shopping list not found or you do not have access to it'
      });
    }
    
    res.json(shoppingList);
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve shopping list'
    });
  }
};

// Update a shopping list
const updateShoppingList = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.user;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    
    const shoppingList = await ShoppingList.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({
        error: 'Shopping list not found',
        message: 'Shopping list not found or you do not have access to it'
      });
    }
    
    Object.keys(updates).forEach(key => {
      shoppingList[key] = updates[key];
    });
    
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (error) {
    console.error('Update shopping list error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update shopping list'
    });
  }
};

// Delete a shopping list
const deleteShoppingList = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shoppingList = await ShoppingList.findOneAndDelete({
      _id: id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({
        error: 'Shopping list not found',
        message: 'Shopping list not found or you do not have access to it'
      });
    }
    
    res.json({
      message: 'Shopping list deleted successfully'
    });
  } catch (error) {
    console.error('Delete shopping list error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete shopping list'
    });
  }
};

// Add item to shopping list
const addItemToList = async (req, res) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    
    const shoppingList = await ShoppingList.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({
        error: 'Shopping list not found',
        message: 'Shopping list not found or you do not have access to it'
      });
    }
    
    const item = await shoppingList.addItem(itemData);
    
    res.json(item);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to add item to shopping list'
    });
  }
};

// Mark item as purchased
const markItemAsPurchased = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { purchased = true } = req.body;
    
    const shoppingList = await ShoppingList.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({
        error: 'Shopping list not found',
        message: 'Shopping list not found or you do not have access to it'
      });
    }
    
    await shoppingList.markAsPurchased(itemId, purchased);
    
    res.json({
      message: `Item marked as ${purchased ? 'purchased' : 'not purchased'}`
    });
  } catch (error) {
    console.error('Mark item error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update item status'
    });
  }
};

module.exports = {
  createShoppingList,
  getUserShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  markItemAsPurchased
};
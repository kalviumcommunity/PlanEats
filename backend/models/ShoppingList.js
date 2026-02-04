const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  items: [{
    ingredient: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['produce', 'meat', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages', 'other'],
      default: 'other'
    },
    purchased: {
      type: Boolean,
      default: false
    },
    estimatedCost: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  budget: {
    total: {
      type: Number,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  stores: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: String,
    preferred: {
      type: Boolean,
      default: false
    }
  }],
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
      }
    }]
  }
}, {
  timestamps: true
});

// Index for performance
shoppingListSchema.index({ user: 1, status: 1 });
shoppingListSchema.index({ 'items.purchased': 1 });
shoppingListSchema.index({ createdAt: -1 });

// Virtual for total items count
shoppingListSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for purchased items count
shoppingListSchema.virtual('purchasedItems').get(function() {
  return this.items.filter(item => item.purchased).length;
});

// Virtual for completion percentage
shoppingListSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  return Math.round((this.purchasedItems / this.totalItems) * 100);
});

// Virtual for remaining budget
shoppingListSchema.virtual('remainingBudget').get(function() {
  if (this.budget.total) {
    return this.budget.total - this.budget.spent;
  }
  return null;
});

// Static method to get active shopping lists for a user
shoppingListSchema.statics.getActiveLists = function(userId) {
  return this.find({ user: userId, status: 'active' })
    .sort({ createdAt: -1 });
};

// Static method to get shopping list by user and name
shoppingListSchema.statics.findByName = function(userId, name) {
  return this.findOne({ user: userId, name: new RegExp(name, 'i') });
};

// Method to add item to shopping list
shoppingListSchema.methods.addItem = function(itemData) {
  this.items.push(itemData);
  return this.save();
};

// Method to mark item as purchased
shoppingListSchema.methods.markAsPurchased = function(itemId, purchased = true) {
  const item = this.items.id(itemId);
  if (item) {
    item.purchased = purchased;
    return this.save();
  }
  throw new Error('Item not found');
};

// Method to update budget spent
shoppingListSchema.methods.updateSpent = function(amount) {
  this.budget.spent += amount;
  return this.save();
};

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
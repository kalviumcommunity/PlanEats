const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meal plan title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in days
    required: true,
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  type: {
    type: String,
    enum: ['weekly', 'daily', 'custom'],
    default: 'weekly'
  },
  goals: {
    type: [String],
    enum: ['weight-loss', 'weight-gain', 'muscle-building', 'maintenance', 'health-improvement', 'meal-prep'],
    default: ['maintenance']
  },
  targetNutrition: {
    dailyCalories: { type: Number, min: 800, max: 5000 },
    proteinGrams: Number,
    carbGrams: Number,
    fatGrams: Number,
    fiberGrams: Number,
    sodiumMg: Number
  },
  dietaryRestrictions: {
    type: [String],
    enum: ['vegan', 'vegetarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'low-fat'],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  preferredIngredients: {
    type: [String],
    default: []
  },
  avoidedIngredients: {
    type: [String],
    default: []
  },
  meals: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    date: Date,
    dayName: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    breakfast: {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      customMeal: {
        name: String,
        ingredients: [String],
        instructions: String,
        nutrition: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fat: Number
        }
      },
      servings: { type: Number, default: 1 },
      notes: String,
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 }
    },
    lunch: {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      customMeal: {
        name: String,
        ingredients: [String],
        instructions: String,
        nutrition: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fat: Number
        }
      },
      servings: { type: Number, default: 1 },
      notes: String,
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 }
    },
    dinner: {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      customMeal: {
        name: String,
        ingredients: [String],
        instructions: String,
        nutrition: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fat: Number
        }
      },
      servings: { type: Number, default: 1 },
      notes: String,
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 }
    },
    snacks: [{
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      customMeal: {
        name: String,
        ingredients: [String],
        instructions: String,
        nutrition: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fat: Number
        }
      },
      servings: { type: Number, default: 1 },
      notes: String,
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      time: String // e.g., 'morning', 'afternoon', 'evening'
    }],
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 }
    },
    waterIntake: { type: Number, default: 0 }, // in ml
    notes: String,
    mood: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor', 'terrible']
    },
    energyLevel: {
      type: String,
      enum: ['very-high', 'high', 'medium', 'low', 'very-low']
    }
  }],
  shoppingList: [{
    ingredient: {
      type: String,
      required: true
    },
    amount: Number,
    unit: String,
    category: {
      type: String,
      enum: ['produce', 'meat', 'dairy', 'pantry', 'frozen', 'bakery', 'other'],
      default: 'other'
    },
    purchased: { type: Boolean, default: false },
    estimatedCost: Number,
    notes: String
  }],
  budget: {
    total: Number,
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  settings: {
    mealsPerDay: { type: Number, default: 3, min: 1, max: 6 },
    snacksPerDay: { type: Number, default: 2, min: 0, max: 5 },
    cookingTime: {
      type: String,
      enum: ['minimal', 'moderate', 'extended'],
      default: 'moderate'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    varietyLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    mealPrepFriendly: { type: Boolean, default: false },
    autoGenerateShoppingList: { type: Boolean, default: true }
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String, // Store the original prompt used for AI generation
  aiModel: String, // Store which AI model was used
  generationMetadata: {
    ingredientsUsed: [String],
    cuisinePreferences: [String],
    excludedIngredients: [String],
    nutritionalFocus: String,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused', 'archived'],
    default: 'draft'
  },
  progress: {
    completedDays: { type: Number, default: 0 },
    completedMeals: { type: Number, default: 0 },
    totalMeals: { type: Number, default: 0 },
    adherencePercentage: { type: Number, default: 0 }
  },
  analytics: {
    averageRating: { type: Number, default: 0 },
    favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    nutritionTrends: [{
      date: Date,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    }],
    moodTrends: [{
      date: Date,
      mood: String,
      energyLevel: String
    }]
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
mealPlanSchema.virtual('completionPercentage').get(function() {
  if (this.progress.totalMeals === 0) return 0;
  return Math.round((this.progress.completedMeals / this.progress.totalMeals) * 100);
});

// Virtual for remaining days
mealPlanSchema.virtual('remainingDays').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const timeDiff = endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(0, daysDiff);
});

// Virtual for total estimated cost
mealPlanSchema.virtual('totalEstimatedCost').get(function() {
  return this.shoppingList.reduce((total, item) => {
    return total + (item.estimatedCost || 0);
  }, 0);
});

// Index for performance
mealPlanSchema.index({ user: 1, status: 1 });
mealPlanSchema.index({ startDate: 1, endDate: 1 });
mealPlanSchema.index({ aiGenerated: 1 });
mealPlanSchema.index({ isPublic: 1, 'rating.average': -1 });
mealPlanSchema.index({ tags: 1 });

// Pre-save middleware to calculate totals
mealPlanSchema.pre('save', function(next) {
  // Calculate total meals
  this.progress.totalMeals = this.meals.length * this.settings.mealsPerDay;
  
  // Calculate completed meals
  this.progress.completedMeals = this.meals.reduce((total, day) => {
    let dayCompleted = 0;
    if (day.breakfast && day.breakfast.completed) dayCompleted++;
    if (day.lunch && day.lunch.completed) dayCompleted++;
    if (day.dinner && day.dinner.completed) dayCompleted++;
    if (day.snacks) {
      dayCompleted += day.snacks.filter(snack => snack.completed).length;
    }
    return total + dayCompleted;
  }, 0);

  // Calculate adherence percentage
  if (this.progress.totalMeals > 0) {
    this.progress.adherencePercentage = Math.round(
      (this.progress.completedMeals / this.progress.totalMeals) * 100
    );
  }

  // Calculate completed days
  this.progress.completedDays = this.meals.filter(day => {
    const dayMeals = [day.breakfast, day.lunch, day.dinner].filter(meal => meal && meal.completed);
    return dayMeals.length >= 2; // Consider day completed if at least 2 main meals are completed
  }).length;

  // Update dates for meals
  this.meals.forEach((meal, index) => {
    if (!meal.date) {
      const mealDate = new Date(this.startDate);
      mealDate.setDate(mealDate.getDate() + index);
      meal.date = mealDate;
      
      // Set day name
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      meal.dayName = dayNames[mealDate.getDay()];
    }
  });

  next();
});

// Static method to find meal plans by user
mealPlanSchema.statics.findByUser = function(userId, options = {}) {
  const { status = null, limit = 10, skip = 0 } = options;
  
  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('meals.breakfast.recipe', 'title images nutrition')
    .populate('meals.lunch.recipe', 'title images nutrition')
    .populate('meals.dinner.recipe', 'title images nutrition')
    .populate('meals.snacks.recipe', 'title images nutrition')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Method to generate shopping list
mealPlanSchema.methods.generateShoppingList = function() {
  const ingredientMap = new Map();

  this.meals.forEach(day => {
    // Process all meals for the day
    const mealsToProcess = [day.breakfast, day.lunch, day.dinner, ...day.snacks];
    
    mealsToProcess.forEach(meal => {
      if (meal && meal.recipe) {
        // This would need to be populated to access ingredients
        if (meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach(ingredient => {
            const key = ingredient.name.toLowerCase();
            const servings = meal.servings || 1;
            const totalAmount = ingredient.amount * servings;

            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key);
              existing.amount += totalAmount;
            } else {
              ingredientMap.set(key, {
                ingredient: ingredient.name,
                amount: totalAmount,
                unit: ingredient.unit,
                category: this.categorizeIngredient(ingredient.name),
                purchased: false
              });
            }
          });
        }
      }
    });
  });

  this.shoppingList = Array.from(ingredientMap.values());
  return this.save();
};

// Helper method to categorize ingredients
mealPlanSchema.methods.categorizeIngredient = function(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  if (['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'salmon', 'tuna'].some(meat => name.includes(meat))) {
    return 'meat';
  }
  if (['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'].some(dairy => name.includes(dairy))) {
    return 'dairy';
  }
  if (['apple', 'banana', 'orange', 'tomato', 'onion', 'carrot', 'lettuce', 'spinach'].some(produce => name.includes(produce))) {
    return 'produce';
  }
  if (['bread', 'bagel', 'muffin', 'cake', 'cookies'].some(bakery => name.includes(bakery))) {
    return 'bakery';
  }
  if (['frozen', 'ice cream', 'frozen vegetables'].some(frozen => name.includes(frozen))) {
    return 'frozen';
  }
  
  return 'pantry';
};

// Method to update meal completion
mealPlanSchema.methods.updateMealCompletion = function(dayIndex, mealType, completed, rating = null) {
  if (this.meals[dayIndex] && this.meals[dayIndex][mealType]) {
    this.meals[dayIndex][mealType].completed = completed;
    if (rating) {
      this.meals[dayIndex][mealType].rating = rating;
    }
  }
  return this.save();
};

// Method to calculate daily nutrition for a specific day
mealPlanSchema.methods.calculateDayNutrition = function(dayIndex) {
  if (!this.meals[dayIndex]) return null;

  const day = this.meals[dayIndex];
  const nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };

  // Helper function to add nutrition from a meal
  const addMealNutrition = (meal) => {
    if (meal && meal.recipe && meal.recipe.nutrition) {
      const servings = meal.servings || 1;
      nutrition.calories += (meal.recipe.nutrition.calories || 0) * servings;
      nutrition.protein += (meal.recipe.nutrition.protein || 0) * servings;
      nutrition.carbs += (meal.recipe.nutrition.carbohydrates || 0) * servings;
      nutrition.fat += (meal.recipe.nutrition.fat || 0) * servings;
      nutrition.fiber += (meal.recipe.nutrition.fiber || 0) * servings;
      nutrition.sodium += (meal.recipe.nutrition.sodium || 0) * servings;
    } else if (meal && meal.customMeal && meal.customMeal.nutrition) {
      const servings = meal.servings || 1;
      nutrition.calories += (meal.customMeal.nutrition.calories || 0) * servings;
      nutrition.protein += (meal.customMeal.nutrition.protein || 0) * servings;
      nutrition.carbs += (meal.customMeal.nutrition.carbs || 0) * servings;
      nutrition.fat += (meal.customMeal.nutrition.fat || 0) * servings;
    }
  };

  // Add nutrition from main meals
  addMealNutrition(day.breakfast);
  addMealNutrition(day.lunch);
  addMealNutrition(day.dinner);

  // Add nutrition from snacks
  if (day.snacks) {
    day.snacks.forEach(addMealNutrition);
  }

  // Update the day's total nutrition
  day.totalNutrition = nutrition;
  
  return nutrition;
};

module.exports = mongoose.model('MealPlan', mealPlanSchema);
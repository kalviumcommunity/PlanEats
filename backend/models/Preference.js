const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dietaryPreferences: {
    type: [String],
    enum: ['vegan', 'vegetarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'low-fat', 'high-protein', 'low-sodium'],
    default: []
  },
  allergies: {
    type: [String],
    enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soy', 'sesame'],
    default: []
  },
  favoriteIngredients: [{
    type: String,
    trim: true
  }],
  dislikedIngredients: [{
    type: String,
    trim: true
  }],
  cuisinePreferences: [{
    type: String,
    enum: ['american', 'italian', 'mexican', 'chinese', 'indian', 'mediterranean', 'french', 'japanese', 'thai', 'greek', 'korean', 'middle-eastern', 'spanish', 'british', 'german', 'other']
  }],
  mealPreferences: {
    breakfast: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'any'],
      default: 'any'
    },
    lunch: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'any'],
      default: 'any'
    },
    dinner: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'any'],
      default: 'any'
    }
  },
  cookingPreferences: {
    timeAvailability: {
      type: String,
      enum: ['minimal', 'moderate', 'extended'],
      default: 'moderate'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    mealPrep: {
      type: Boolean,
      default: false
    }
  },
  nutritionGoals: {
    dailyCalories: {
      type: Number,
      min: 800,
      max: 5000
    },
    macronutrientRatios: {
      protein: { type: Number, default: 20, min: 10, max: 40 },
      carbs: { type: Number, default: 50, min: 30, max: 70 },
      fat: { type: Number, default: 30, min: 20, max: 40 }
    },
    specificTargets: {
      proteinGrams: Number,
      carbGrams: Number,
      fatGrams: Number,
      fiberGrams: Number,
      sodiumMg: Number
    }
  },
  notificationSettings: {
    email: {
      mealReminders: { type: Boolean, default: true },
      planUpdates: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true }
    },
    push: {
      mealReminders: { type: Boolean, default: true },
      planUpdates: { type: Boolean, default: true }
    }
  },
  uiPreferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'private'
    },
    recipeSharing: {
      type: Boolean,
      default: false
    },
    mealPlanSharing: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for performance
// Note: user field is already indexed via unique: true in the schema

// Ensure user reference is populated
preferenceSchema.pre('find', function() {
  this.populate('user', 'username email');
});

module.exports = mongoose.model('Preference', preferenceSchema);
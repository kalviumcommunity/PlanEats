const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive']
    },
    unit: {
      type: String,
      required: true,
      enum: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'slice', 'clove', 'pinch', 'dash']
    },
    notes: String
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Instruction cannot exceed 1000 characters']
    },
    duration: Number, // in minutes
    temperature: Number // in fahrenheit
  }],
  nutrition: {
    calories: Number,
    protein: Number, // in grams
    carbohydrates: Number, // in grams
    fat: Number, // in grams
    fiber: Number, // in grams
    sugar: Number, // in grams
    sodium: Number, // in mg
    cholesterol: Number, // in mg
    saturatedFat: Number, // in grams
    transFat: Number, // in grams
    vitaminA: Number, // in IU
    vitaminC: Number, // in mg
    calcium: Number, // in mg
    iron: Number // in mg
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  prepTime: {
    type: Number, // in minutes
    required: [true, 'Prep time is required'],
    min: [0, 'Prep time cannot be negative']
  },
  cookTime: {
    type: Number, // in minutes
    required: [true, 'Cook time is required'],
    min: [0, 'Cook time cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  cuisine: {
    type: String,
    enum: ['american', 'italian', 'mexican', 'chinese', 'indian', 'mediterranean', 'french', 'japanese', 'thai', 'greek', 'korean', 'middle-eastern', 'spanish', 'british', 'german', 'other'],
    default: 'other'
  },
  mealType: {
    type: [String],
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'side-dish'],
    required: true
  },
  dietaryTags: {
    type: [String],
    enum: ['vegan', 'vegetarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'low-fat', 'high-protein', 'low-sodium'],
    default: []
  },
  allergens: {
    type: [String],
    enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soy', 'sesame'],
    default: []
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['user-created', 'imported', 'ai-generated'],
    default: 'user-created'
  },
  sourceUrl: String,
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  equipment: [String],
  tips: [String],
  variations: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual for calories per serving
recipeSchema.virtual('caloriesPerServing').get(function() {
  if (this.nutrition && this.nutrition.calories && this.servings) {
    return Math.round(this.nutrition.calories / this.servings);
  }
  return null;
});

// Index for search performance
recipeSchema.index({ title: 'text', description: 'text', 'ingredients.name': 'text' });
recipeSchema.index({ author: 1 });
recipeSchema.index({ dietaryTags: 1 });
recipeSchema.index({ mealType: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ 'rating.average': -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ favorites: -1 });

// Pre-save middleware to update rating average
recipeSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
  next();
});

// Static method to find recipes by ingredients
recipeSchema.statics.findByIngredients = function(ingredients, options = {}) {
  const {
    dietaryTags = [],
    mealType = [],
    limit = 20,
    skip = 0
  } = options;

  const query = {
    'ingredients.name': { $in: ingredients.map(ing => new RegExp(ing, 'i')) },
    isPublic: true
  };

  if (dietaryTags.length > 0) {
    query.dietaryTags = { $in: dietaryTags };
  }

  if (mealType.length > 0) {
    query.mealType = { $in: mealType };
  }

  return this.find(query)
    .populate('author', 'username profile.firstName profile.lastName')
    .sort({ 'rating.average': -1, favorites: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to search recipes
recipeSchema.statics.searchRecipes = function(searchTerm, options = {}) {
  const {
    dietaryTags = [],
    mealType = [],
    cuisine = [],
    difficulty = [],
    maxPrepTime = null,
    maxCookTime = null,
    limit = 20,
    skip = 0,
    sortBy = 'relevance'
  } = options;

  const query = {
    $text: { $search: searchTerm },
    isPublic: true
  };

  if (dietaryTags.length > 0) {
    query.dietaryTags = { $in: dietaryTags };
  }

  if (mealType.length > 0) {
    query.mealType = { $in: mealType };
  }

  if (cuisine.length > 0) {
    query.cuisine = { $in: cuisine };
  }

  if (difficulty.length > 0) {
    query.difficulty = { $in: difficulty };
  }

  if (maxPrepTime) {
    query.prepTime = { $lte: maxPrepTime };
  }

  if (maxCookTime) {
    query.cookTime = { $lte: maxCookTime };
  }

  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { 'rating.average': -1, favorites: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'prepTime':
      sort = { prepTime: 1 };
      break;
    case 'totalTime':
      sort = { $expr: { $add: ['$prepTime', '$cookTime'] } };
      break;
    default:
      sort = { score: { $meta: 'textScore' } };
  }

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('author', 'username profile.firstName profile.lastName')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Method to add review
recipeSchema.methods.addReview = function(userId, rating, comment) {
  const existingReviewIndex = this.reviews.findIndex(
    review => review.user.toString() === userId.toString()
  );

  if (existingReviewIndex !== -1) {
    // Update existing review
    this.reviews[existingReviewIndex].rating = rating;
    this.reviews[existingReviewIndex].comment = comment;
    this.reviews[existingReviewIndex].createdAt = new Date();
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment,
      createdAt: new Date()
    });
  }

  return this.save();
};

// Method to increment view count
recipeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Recipe', recipeSchema);
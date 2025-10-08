import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import recipeService from '../services/recipes';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dietaryTags: [],
    mealType: [],
    cuisine: [],
    difficulty: '',
    maxPrepTime: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState({});
  const [pagination, setPagination] = useState({});
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, [filters, searchTerm]);

  const fetchRecipes = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchTerm,
        page
      };
      
      // Convert arrays to comma-separated strings
      if (filters.dietaryTags.length > 0) {
        params.dietaryTags = filters.dietaryTags.join(',');
      }
      if (filters.mealType.length > 0) {
        params.mealType = filters.mealType.join(',');
      }
      if (filters.cuisine.length > 0) {
        params.cuisine = filters.cuisine.join(',');
      }
      
      const data = await recipeService.getRecipes(params);
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await recipeService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        const newArray = prev[filterType].includes(value)
          ? prev[filterType].filter(item => item !== value)
          : [...prev[filterType], value];
        return { ...prev, [filterType]: newArray };
      }
      return { ...prev, [filterType]: value };
    });
  };

  const handleToggleFavorite = async (recipeId) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to favorite recipes');
      return;
    }

    try {
      await recipeService.toggleFavorite(recipeId);
      toast.success('Recipe favorite status updated');
      // Optionally refresh recipes to update favorite status
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const RecipeCard = ({ recipe }) => {
    const [isFavorited, setIsFavorited] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card hover-lift overflow-hidden"
      >
        {/* Recipe Image */}
        <div className="relative h-48 bg-dark-800">
          {recipe.images && recipe.images.length > 0 ? (
            <img
              src={recipe.images.find(img => img.isPrimary)?.url || recipe.images[0]?.url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <SparklesIcon className="w-16 h-16 text-dark-600" />
            </div>
          )}
          
          {/* Favorite Button */}
          {isAuthenticated() && (
            <button
              onClick={() => {
                setIsFavorited(!isFavorited);
                handleToggleFavorite(recipe._id);
              }}
              className="absolute top-3 right-3 p-2 bg-dark-900/80 rounded-full hover:bg-dark-900 transition-colors"
            >
              {isFavorited ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white" />
              )}
            </button>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${
              recipe.difficulty === 'easy' ? 'badge-success' :
              recipe.difficulty === 'medium' ? 'badge-warning' :
              'badge-danger'
            }`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-white line-clamp-2">
              {recipe.title}
            </h3>
          </div>
          
          <p className="text-dark-300 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {/* Recipe Meta */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-dark-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4" />
              <span>{recipe.rating?.average?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.dietaryTags?.slice(0, 3).map(tag => (
              <span key={tag} className="badge badge-primary text-xs">
                {tag}
              </span>
            ))}
            {recipe.dietaryTags?.length > 3 && (
              <span className="badge badge-secondary text-xs">
                +{recipe.dietaryTags.length - 3} more
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link
            to={`/recipes/${recipe._id}`}
            className="btn-primary w-full text-center"
          >
            View Recipe
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Discover Recipes</h1>
          <p className="text-dark-300 max-w-2xl mx-auto">
            Browse our collection of delicious recipes, search by ingredients, and find your next favorite meal
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-dark-700 pt-6 space-y-4"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Dietary Tags */}
                <div>
                  <label className="form-label mb-2">Dietary Preferences</label>
                  <div className="space-y-2">
                    {categories.dietaryTags?.map(tag => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.dietaryTags.includes(tag)}
                          onChange={() => handleFilterChange('dietaryTags', tag)}
                          className="rounded"
                        />
                        <span className="text-sm text-dark-300">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal Type */}
                <div>
                  <label className="form-label mb-2">Meal Type</label>
                  <div className="space-y-2">
                    {categories.mealTypes?.map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.mealType.includes(type)}
                          onChange={() => handleFilterChange('mealType', type)}
                          className="rounded"
                        />
                        <span className="text-sm text-dark-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="form-label mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Any</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="form-label mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input w-full"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="rating">Rating</option>
                    <option value="prepTime">Prep Time</option>
                    <option value="totalTime">Total Time</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-48 bg-dark-800 rounded mb-4"></div>
                <div className="h-4 bg-dark-800 rounded mb-2"></div>
                <div className="h-4 bg-dark-800 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-dark-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {recipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => fetchRecipes(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-dark-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchRecipes(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-300 mb-2">No recipes found</h3>
            <p className="text-dark-400">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
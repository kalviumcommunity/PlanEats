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

      const response = await recipeService.getRecipes(params);
      setRecipes(response.recipes);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await recipeService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType]?.includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...(prev[filterType] || []), value]
    }));
  };

  const toggleFavorite = async (recipeId) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to save recipes');
      return;
    }

    try {
      await recipeService.toggleFavorite(recipeId);
      setRecipes(prev => prev.map(recipe => 
        recipe._id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      ));
      toast.success('Recipe saved to favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to save recipe');
    }
  };

  const RecipeCard = ({ recipe }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          {recipe.images && recipe.images.length > 0 ? (
            <img 
              src={recipe.images && recipe.images.length > 0 ? recipe.images[0].url : `https://source.unsplash.com/800x400/?food,recipe,dish,meal`}
              alt={recipe.images && recipe.images.length > 0 ? recipe.images[0].alt || recipe.title : `${recipe.title} recipe`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-orange-600">
              <SparklesIcon className="h-12 w-12 mx-auto" />
              <p className="text-sm font-medium mt-2">{recipe.title}</p>
            </div>
          )}
        </div>
        {isAuthenticated() && (
          <button
            onClick={() => toggleFavorite(recipe._id)}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {recipe.isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
            )}
          </button>
        )}
      </div>
      
      <div className="p-6">
        <Link to={`/recipes/${recipe._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{recipe.prepTime + recipe.cookTime}m</span>
            </div>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{recipe.rating?.average?.toFixed(1) || 'New'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {recipe.dietaryTags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {recipe.dietaryTags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              +{recipe.dietaryTags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  const FilterSection = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Recipe</h2>
        
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 border border-orange-200 transition-colors"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 pt-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dietary Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Tags</label>
              <div className="space-y-2">
                {categories.dietaryTags?.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.dietaryTags.includes(tag)}
                      onChange={() => toggleFilter('dietaryTags', tag)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Meal Type</label>
              <div className="space-y-2">
                {categories.mealTypes?.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.mealType.includes(type)}
                      onChange={() => toggleFilter('mealType', type)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisines */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Cuisine</label>
              <div className="space-y-2">
                {categories.cuisines?.map(cuisine => (
                  <label key={cuisine} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.cuisine.includes(cuisine)}
                      onChange={() => toggleFilter('cuisine', cuisine)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty & Sort */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="prepTime">Shortest Prep Time</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <FilterSection />

        {!loading && recipes.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => fetchRecipes(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pagination.currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  HeartIcon,
  PrinterIcon,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import recipeService from '../services/recipes';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipe(id);
      setRecipe(data.recipe);
      // Check if recipe is in user's favorites (you'd need to implement this check)
      // setIsFavorited(checkIfFavorited(data.recipe._id));
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated()) {
      toast.error('Please log in to favorite recipes');
      return;
    }

    try {
      await recipeService.toggleFavorite(recipe._id);
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please log in to add a review');
      return;
    }

    try {
      setSubmittingReview(true);
      await recipeService.addReview(recipe._id, reviewData.rating, reviewData.comment);
      toast.success('Review added successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      // Refresh recipe to show new review
      fetchRecipe();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-dark-800 rounded w-1/4"></div>
            <div className="h-64 bg-dark-800 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-dark-800 rounded w-3/4"></div>
              <div className="h-4 bg-dark-800 rounded w-1/2"></div>
              <div className="h-4 bg-dark-800 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <div className="text-center">
            <SparklesIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-dark-300 mb-2">Recipe not found</h2>
            <button
              onClick={() => navigate('/recipes')}
              className="btn-primary"
            >
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mb-6 flex items-center space-x-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              {/* Recipe Image */}
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                {recipe.images && recipe.images.length > 0 ? (
                  <img
                    src={recipe.images.find(img => img.isPrimary)?.url || recipe.images[0]?.url}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                    <SparklesIcon className="w-16 h-16 text-dark-600" />
                  </div>
                )}
              </div>

              {/* Recipe Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
                    <p className="text-dark-300">{recipe.description}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleFavorite}
                      className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      {isFavorited ? (
                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-dark-400 hover:text-red-500" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <ShareIcon className="w-6 h-6 text-dark-400 hover:text-white" />
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <PrinterIcon className="w-6 h-6 text-dark-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Recipe Meta */}
                <div className="flex flex-wrap items-center gap-6 text-dark-300">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>Prep: {recipe.prepTime}m</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>Cook: {recipe.cookTime}m</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-5 h-5" />
                    <span>{recipe.rating?.average?.toFixed(1) || 'No ratings'} ({recipe.rating?.count || 0} reviews)</span>
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryTags?.map(tag => (
                    <span key={tag} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                  <span className={`badge ${
                    recipe.difficulty === 'easy' ? 'badge-success' :
                    recipe.difficulty === 'medium' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Ingredients */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Ingredients</h2>
              <div className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-dark-800 rounded">
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                    <span className="text-dark-200">
                      <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                      {' '}
                      <span>{ingredient.name}</span>
                      {ingredient.notes && (
                        <span className="text-dark-400 text-sm"> ({ingredient.notes})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
              <div className="space-y-4">
                {recipe.instructions?.map((instruction, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {instruction.step || index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-dark-200 leading-relaxed">{instruction.description}</p>
                      {(instruction.duration || instruction.temperature) && (
                        <div className="flex items-center space-x-4 mt-2 text-sm text-dark-400">
                          {instruction.duration && (
                            <span>⏱️ {instruction.duration} min</span>
                          )}
                          {instruction.temperature && (
                            <span>🌡️ {instruction.temperature}°F</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                {isAuthenticated() && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-primary"
                  >
                    Add Review
                  </button>
                )}
              </div>

              {/* Add Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-dark-700 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                            className="text-2xl hover:scale-110 transition-transform"
                          >
                            {star <= reviewData.rating ? (
                              <StarIconSolid className="w-6 h-6 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-6 h-6 text-dark-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Comment (optional)</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        className="input h-24 resize-none"
                        placeholder="Share your thoughts about this recipe..."
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {recipe.reviews?.length > 0 ? (
                  recipe.reviews.map((review, index) => (
                    <div key={index} className="border-b border-dark-700 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {review.user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {review.user?.profile?.firstName || review.user?.username}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  i < review.rating ? (
                                    <StarIconSolid key={i} className="w-4 h-4 text-yellow-500" />
                                  ) : (
                                    <StarIcon key={i} className="w-4 h-4 text-dark-600" />
                                  )
                                ))}
                              </div>
                              <span className="text-sm text-dark-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-dark-300 ml-11">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-dark-400 text-center py-8">No reviews yet. Be the first to review this recipe!</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Info */}
            {recipe.nutrition && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Nutrition (per serving)</h3>
                <div className="space-y-3">
                  {recipe.nutrition.calories && (
                    <div className="flex justify-between">
                      <span className="text-dark-300">Calories</span>
                      <span className="text-white font-medium">{Math.round(recipe.nutrition.calories / recipe.servings)}</span>
                    </div>
                  )}
                  {recipe.nutrition.protein && (
                    <div className="flex justify-between">
                      <span className="text-dark-300">Protein</span>
                      <span className="text-white font-medium">{Math.round(recipe.nutrition.protein / recipe.servings)}g</span>
                    </div>
                  )}
                  {recipe.nutrition.carbohydrates && (
                    <div className="flex justify-between">
                      <span className="text-dark-300">Carbs</span>
                      <span className="text-white font-medium">{Math.round(recipe.nutrition.carbohydrates / recipe.servings)}g</span>
                    </div>
                  )}
                  {recipe.nutrition.fat && (
                    <div className="flex justify-between">
                      <span className="text-dark-300">Fat</span>
                      <span className="text-white font-medium">{Math.round(recipe.nutrition.fat / recipe.servings)}g</span>
                    </div>
                  )}
                  {recipe.nutrition.fiber && (
                    <div className="flex justify-between">
                      <span className="text-dark-300">Fiber</span>
                      <span className="text-white font-medium">{Math.round(recipe.nutrition.fiber / recipe.servings)}g</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Recipe Author */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Recipe by</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {recipe.author?.username?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {recipe.author?.profile?.fullName || recipe.author?.username}
                  </p>
                  <p className="text-sm text-dark-400">Recipe Author</p>
                </div>
              </div>
            </motion.div>

            {/* Equipment */}
            {recipe.equipment && recipe.equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Equipment Needed</h3>
                <div className="space-y-2">
                  {recipe.equipment.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                      <span className="text-dark-300">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
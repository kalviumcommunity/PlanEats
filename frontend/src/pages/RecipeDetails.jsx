import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  HeartIcon,
  PrinterIcon,
  ShareIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon
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
  const [expandedInstructions, setExpandedInstructions] = useState({});
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
      setIsFavorited(data.recipe.isFavorite || false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to save recipes');
      return;
    }

    try {
      await recipeService.toggleFavorite(id);
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Recipe removed from favorites' : 'Recipe saved to favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to save recipe');
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to review recipes');
      return;
    }

    if (!reviewData.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await recipeService.addReview(id, reviewData.rating, reviewData.comment);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchRecipe(); // Refresh the recipe data
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleInstructionStep = (stepNumber) => {
    setExpandedInstructions(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const NutritionalInfo = ({ nutrition, servings }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information (per serving)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{nutrition?.calories || 0}</p>
          <p className="text-sm text-gray-600">Calories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{nutrition?.protein || 0}g</p>
          <p className="text-sm text-gray-600">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{nutrition?.carbohydrates || 0}g</p>
          <p className="text-sm text-gray-600">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{nutrition?.fat || 0}g</p>
          <p className="text-sm text-gray-600">Fat</p>
        </div>
      </div>
      {nutrition?.fiber && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">{nutrition.fiber}g</p>
            <p className="text-sm text-gray-600">Fiber</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">{nutrition.sugar}g</p>
            <p className="text-sm text-gray-600">Sugar</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">{nutrition.sodium}mg</p>
            <p className="text-sm text-gray-600">Sodium</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">{nutrition.cholesterol}mg</p>
            <p className="text-sm text-gray-600">Cholesterol</p>
          </div>
        </div>
      )}
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 text-sm font-medium">
              {review.user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <span className="font-medium text-gray-900">{review.user?.username || 'Anonymous'}</span>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{review.comment}</p>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe not found</h3>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/recipes"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Recipes
          </button>
          
          <div className="mb-8">
            {/* Main recipe image */}
            <div className="relative h-96 w-full rounded-xl overflow-hidden mb-6">
              {recipe.images && recipe.images.length > 0 ? (
                <img 
                  src={recipe.images && recipe.images.length > 0 ? recipe.images[0].url : `https://source.unsplash.com/1200x600/?food,recipe,dish,meal,${recipe.title.replace(/\s+/g, '-')}`}
                  alt={recipe.images && recipe.images.length > 0 ? recipe.images[0].alt || recipe.title : `${recipe.title} recipe`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-orange-200 to-orange-300 flex items-center justify-center">
                  <div className="text-center text-orange-600">
                    <SparklesIcon className="h-16 w-16 mx-auto" />
                    <p className="text-lg font-medium mt-2">{recipe.title}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
                <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2 text-orange-500" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                    <span>{recipe.prepTime}m prep, {recipe.cookTime}m cook</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-orange-500" />
                    <span>{recipe.rating?.average?.toFixed(1) || 'New'} ({recipe.rating?.count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {recipe.dietaryTags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {recipe.cuisine && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {recipe.cuisine}
                    </span>
                  )}
                  {recipe.mealType?.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full ${
                    isFavorited
                      ? 'bg-red-100 text-red-500 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                  } transition-colors`}
                >
                  {isFavorited ? (
                    <HeartIconSolid className="h-6 w-6" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
                <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors">
                  <PrinterIcon className="h-6 w-6" />
                </button>
                <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors">
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients and Nutrition */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                      {ingredient.notes && ` (${ingredient.notes})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <div className="space-y-4">
                {recipe.instructions?.map((instruction, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <button
                      onClick={() => toggleInstructionStep(instruction.step)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">{instruction.step}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {expandedInstructions[instruction.step] ? instruction.description : instruction.description.substring(0, 80) + '...'}
                        </span>
                      </div>
                      {expandedInstructions[instruction.step] ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedInstructions[instruction.step] && (
                      <div className="mt-2 ml-11 text-gray-600">
                        {instruction.description}
                        {instruction.duration && (
                          <p className="text-sm text-gray-500 mt-1">Duration: {instruction.duration} minutes</p>
                        )}
                        {instruction.temperature && (
                          <p className="text-sm text-gray-500 mt-1">Temperature: {instruction.temperature}°F</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <span className="text-sm text-gray-600">
                  {recipe.reviews?.length || 0} reviews
                </span>
              </div>
              
              {recipe.reviews && recipe.reviews.length > 0 ? (
                <div className="space-y-4">
                  {recipe.reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No reviews yet. Be the first to review this recipe!</p>
                </div>
              )}
              
              {isAuthenticated() && (
                <div className="mt-6">
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                              className={`p-1 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <StarIconSolid className="h-6 w-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
                          rows="4"
                          placeholder="Share your thoughts about this recipe..."
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={submitReview}
                          disabled={submittingReview}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewData({ rating: 5, comment: '' });
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Nutrition and Tips */}
          <div className="space-y-8">
            <NutritionalInfo nutrition={recipe.nutrition} servings={recipe.servings} />
            
            {(recipe.tips || recipe.variations) && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips & Variations</h3>
                {recipe.tips && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
                    <ul className="space-y-2">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <SparklesIcon className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipe.variations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Variations:</h4>
                    <ul className="space-y-2">
                      {recipe.variations.map((variation, index) => (
                        <li key={index} className="flex items-start">
                          <SparklesIcon className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{variation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional recipe images gallery */}
      {recipe.images && recipe.images.length > 1 && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">More Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipe.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={image.url}
                  alt={image.alt || `Recipe image ${index + 2}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  SparklesIcon,
  EyeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import mealPlanService from '../services/mealplans';
import toast from 'react-hot-toast';

const MealPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    if (id) {
      fetchMealPlan();
    }
  }, [id]);

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      const data = await mealPlanService.getMealPlan(id);
      // The API returns the meal plan directly, not wrapped in a mealPlan key
      const plan = data.mealPlan || data;
      setMealPlan(plan);
      
      // Set active day to today if within range, otherwise day 1
      const today = new Date();
      const startDate = new Date(plan.startDate);
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= plan.duration) {
        setActiveDay(diffDays);
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      toast.error('Failed to load meal plan details');
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  const toggleMealCompletion = async (dayIndex, mealType, completed) => {
    try {
      const response = await mealPlanService.completeMeal(id, dayIndex, mealType, !completed);
      // Handle both wrapped and direct responses
      const updatedPlan = response.mealPlan || response;
      setMealPlan(updatedPlan);
      toast.success(completed ? 'Meal unmarked' : 'Meal completed!');
    } catch (error) {
      console.error('Error toggling meal completion:', error);
      toast.error('Failed to update meal status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Meal Plan not found</h3>
          <Link
            to="/meal-plans"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Link>
        </div>
      </div>
    );
  }

  const activeDayData = mealPlan.meals.find(m => m.day === activeDay) || mealPlan.meals[0];

  const MealItem = ({ type, data, dayIndex }) => {
    if (!data) return null;
    const isRecipe = !!data.recipe;
    const mealInfo = isRecipe ? data.recipe : data.customMeal;
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500 mr-2">{type}</span>
              {data.completed && (
                <span className="flex items-center text-xs font-medium text-green-600">
                  <CheckCircleSolidIcon className="h-3 w-3 mr-1" />
                  Completed
                </span>
              )}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{mealInfo.title || mealInfo.name}</h4>
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {isRecipe ? `${mealInfo.cookTime}m` : 'AI Suggested'}
              </div>
              <div className="flex items-center">
                <SparklesIcon className="h-3 w-3 mr-1" />
                {Math.round(mealInfo.nutrition?.calories || 0)} kcal
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedMeal({ type, data })}
              className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              title="View Preparation"
            >
              <EyeIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => toggleMealCompletion(dayIndex, type, data.completed)}
              className={`p-2 rounded-lg transition-colors ${
                data.completed 
                  ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {data.completed ? <CheckCircleSolidIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/meal-plans')}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Meal Plans
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{mealPlan.title}</h1>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
                  {mealPlan.aiGenerated ? 'AI Generated' : 'Custom Plan'}
                </span>
              </div>
              <p className="text-gray-600 max-w-2xl">{mealPlan.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/meal-plans/${id}/shopping-list`}
                className="inline-flex items-center px-4 py-3 bg-white border border-orange-200 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-sm"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Shopping List
              </Link>
              <button
                className="inline-flex items-center px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="text-xl font-bold text-gray-900">{mealPlan.duration} Days</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Daily Calories</p>
            <p className="text-xl font-bold text-gray-900">{mealPlan.targetNutrition?.dailyCalories || 2000} kcal</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completion</p>
            <p className="text-xl font-bold text-gray-900">{mealPlan.progress?.adherencePercentage || 0}%</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-xl font-bold text-orange-600 capitalize">{mealPlan.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Day Selector Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Plan Timeline</h3>
                <CalendarIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                {mealPlan.meals.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`w-full flex items-center p-4 rounded-xl transition-all ${
                      activeDay === day.day
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${
                      activeDay === day.day ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {day.day}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">Day {day.day}</p>
                      <p className={`text-xs ${activeDay === day.day ? 'text-white/80' : 'text-gray-500'}`}>
                        {day.dayName || `Day ${day.day}`}
                      </p>
                    </div>
                    {day.totalNutrition?.calories > 0 && (
                      <div className="ml-auto text-xs font-medium">
                        {Math.round(day.totalNutrition.calories)} kcal
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => activeDay > 1 && setActiveDay(activeDay - 1)}
                      disabled={activeDay === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-30"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Day {activeDay}</h2>
                    <button 
                      onClick={() => activeDay < mealPlan.duration && setActiveDay(activeDay + 1)}
                      disabled={activeDay === mealPlan.duration}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-30"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Daily Total</p>
                    <p className="text-lg font-bold text-orange-600">{Math.round(activeDayData?.totalNutrition?.calories || 0)} kcal</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <MealItem type="breakfast" data={activeDayData?.breakfast} dayIndex={activeDay - 1} />
                  <MealItem type="lunch" data={activeDayData?.lunch} dayIndex={activeDay - 1} />
                  <MealItem type="dinner" data={activeDayData?.dinner} dayIndex={activeDay - 1} />
                  
                  {activeDayData?.snacks?.length > 0 && (
                    <div className="pt-4 border-t border-gray-50">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Snacks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeDayData.snacks.map((snack, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100">
                             <div className="flex-1">
                               <p className="font-semibold text-gray-900">{snack.recipe?.title || snack.customMeal?.name || 'Snack'}</p>
                               <p className="text-xs text-gray-500">{Math.round(snack.recipe?.nutrition?.calories || snack.customMeal?.nutrition?.calories || 0)} kcal</p>
                             </div>
                             {snack.recipe?._id && (
                               <Link to={`/recipes/${snack.recipe._id}`} className="text-orange-500">
                                 <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                               </Link>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Day Nutrition Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Nutrition Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="h-2 w-full bg-orange-100 rounded-full mb-2">
                       <div 
                        className="h-2 bg-orange-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (activeDayData?.totalNutrition?.protein || 0) / (mealPlan.targetNutrition?.proteinGrams || 150) * 100)}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-gray-500">Protein</p>
                    <p className="font-bold">{Math.round(activeDayData?.totalNutrition?.protein || 0)}g / {mealPlan.targetNutrition?.proteinGrams || 150}g</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-blue-100 rounded-full mb-2">
                       <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (activeDayData?.totalNutrition?.carbs || 0) / (mealPlan.targetNutrition?.carbGrams || 250) * 100)}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-gray-500">Carbs</p>
                    <p className="font-bold">{Math.round(activeDayData?.totalNutrition?.carbs || 0)}g / {mealPlan.targetNutrition?.carbGrams || 250}g</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-yellow-100 rounded-full mb-2">
                       <div 
                        className="h-2 bg-yellow-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (activeDayData?.totalNutrition?.fat || 0) / (mealPlan.targetNutrition?.fatGrams || 70) * 100)}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-gray-500">Fats</p>
                    <p className="font-bold">{Math.round(activeDayData?.totalNutrition?.fat || 0)}g / {mealPlan.targetNutrition?.fatGrams || 70}g</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-green-100 rounded-full mb-2">
                       <div 
                        className="h-2 bg-green-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (activeDayData?.totalNutrition?.fiber || 0) / 30 * 100)}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-gray-500">Fiber</p>
                    <p className="font-bold">{Math.round(activeDayData?.totalNutrition?.fiber || 0)}g / 30g</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600">{selectedMeal.type}</span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMeal.data.recipe?.title || selectedMeal.data.customMeal?.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMeal(null)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {selectedMeal.data.recipe ? (
                // If it's a real recipe, show a link to the full page and basic info
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                      <span className="font-medium">{selectedMeal.data.recipe.cookTime} mins</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-orange-500" />
                      <span className="font-medium">{selectedMeal.data.recipe.servings} Servings</span>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{selectedMeal.data.recipe.description}"</p>
                  <div className="pt-4 border-t border-gray-50 flex justify-center">
                    <Link
                      to={`/recipes/${selectedMeal.data.recipe._id}`}
                      className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                    >
                      View Full Recipe & Instructions
                      <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-2" />
                    </Link>
                  </div>
                </div>
              ) : (
                // If it's an AI custom meal, show ingredients and instructions directly
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <ShoppingCartIcon className="h-5 w-5 mr-2 text-orange-500" />
                      Ingredients
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedMeal.data.customMeal.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center text-gray-700 bg-gray-50 p-2 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />
                      Preparation
                    </h4>
                    <div className="bg-orange-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMeal.data.customMeal.instructions}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedMeal(null)}
                className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MealPlanDetails;

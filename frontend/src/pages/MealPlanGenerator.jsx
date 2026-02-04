import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  CpuChipIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import mealPlanService from '../services/mealplans';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const MealPlanGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      ingredients: [''],
      duration: 7,
      dietaryPreferences: user?.dietaryPreferences || [],
      allergies: user?.allergies || [],
      goals: ['maintenance'],
      excludeIngredients: user?.dislikedIngredients || [],
      cuisinePreferences: [],
      cookingTime: 'moderate',
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      servings: 2
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const dietaryOptions = [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'nut-free', label: 'Nut-Free' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'low-fat', label: 'Low Fat' },
    { value: 'high-protein', label: 'High Protein' }
  ];

  const allergyOptions = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'tree-nuts', label: 'Tree Nuts' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'soy', label: 'Soy' },
    { value: 'sesame', label: 'Sesame' }
  ];

  const goalOptions = [
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'weight-gain', label: 'Weight Gain' },
    { value: 'muscle-building', label: 'Muscle Building' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'health-improvement', label: 'Health Improvement' },
    { value: 'meal-prep', label: 'Meal Prep' }
  ];

  const cuisineOptions = [
    { value: 'american', label: 'American' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'indian', label: 'Indian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'french', label: 'French' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'thai', label: 'Thai' },
    { value: 'greek', label: 'Greek' }
  ];

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'side-dish', label: 'Side Dish' }
  ];

  const toggleOption = (field, value) => {
    const currentValues = getValues(field) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const onSubmit = async (data) => {
    try {
      setGenerating(true);
      // Filter out empty ingredients
      const filteredIngredients = data.ingredients.filter(ing => ing.trim() !== '');
      
      const planData = {
        ...data,
        ingredients: filteredIngredients,
        aiGenerated: true,
        aiModel: 'gemini',
        title: `AI Meal Plan - ${new Date().toLocaleDateString()}`,
        description: 'AI-generated meal plan based on your preferences and ingredients'
      };

      const response = await mealPlanService.createMealPlan(planData);
      toast.success('Meal plan generated successfully!');
      navigate(`/meal-plans/${response.mealPlan._id}`);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const ProgressBar = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Create Your Meal Plan</h2>
        <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const StepIndicator = ({ stepNum, title, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (stepNum - 1) * 0.1 }}
      className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        step === stepNum 
          ? 'bg-orange-50 border-2 border-orange-500' 
          : 'bg-white border border-gray-200 hover:border-orange-300'
      }`}
      onClick={() => setStep(stepNum)}
    >
      <div className={`p-3 rounded-lg ${
        step === stepNum ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <h3 className={`font-semibold ${
          step === stepNum ? 'text-orange-600' : 'text-gray-900'
        }`}>{title}</h3>
        <p className="text-sm text-gray-600">Step {stepNum}</p>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <select
                  {...register('duration', { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  {[3, 5, 7, 14, 21, 30].map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings per person
                </label>
                <select
                  {...register('servings', { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} servings</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooking Time Preference
                </label>
                <select
                  {...register('cookingTime', { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="minimal">Minimal (under 30 mins)</option>
                  <option value="moderate">Moderate (30-60 mins)</option>
                  <option value="extended">Extended (over 60 mins)</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Dietary Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('dietaryPreferences', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watch('dietaryPreferences')?.includes(option.value)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Allergies
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergyOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('allergies', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watch('allergies')?.includes(option.value)
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Weight Goals
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goalOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('goals', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watch('goals')?.includes(option.value)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Ingredients</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ingredients you have
                </label>
                <div className="space-y-3">
                  {ingredientFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        {...register(`ingredients.${index}`)}
                        placeholder="Enter ingredient (e.g., chicken, rice, broccoli)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                      {ingredientFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendIngredient('')}
                    className="flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Ingredient
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ingredients to exclude
                </label>
                <input
                  {...register('excludeIngredients')}
                  placeholder="Enter ingredients to avoid, separated by commas"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Cuisine & Meals</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Cuisines
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisineOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('cuisinePreferences', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watch('cuisinePreferences')?.includes(option.value)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meal Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mealTypeOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('mealTypes', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watch('mealTypes')?.includes(option.value)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <ProgressBar />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <StepIndicator stepNum={1} title="Basic Info" icon={CpuChipIcon} />
            <StepIndicator stepNum={2} title="Dietary" icon={HeartIcon} />
            <StepIndicator stepNum={3} title="Ingredients" icon={SparklesIcon} />
            <StepIndicator stepNum={4} title="Preferences" icon={ClockIcon} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  step === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>

              {step < totalSteps ? (
                <button
                  onClick={() => step < totalSteps && setStep(step + 1)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={generating}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Meal Plan'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
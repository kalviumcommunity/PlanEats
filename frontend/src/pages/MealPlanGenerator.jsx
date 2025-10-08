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

  const { fields: excludeFields, append: appendExclude, remove: removeExclude } = useFieldArray({
    control,
    name: 'excludeIngredients'
  });

  const dietaryOptions = [
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🥩' },
    { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { value: 'nut-free', label: 'Nut-Free', icon: '🥜' },
    { value: 'low-carb', label: 'Low-Carb', icon: '🥒' },
    { value: 'low-fat', label: 'Low-Fat', icon: '🍃' },
    { value: 'high-protein', label: 'High-Protein', icon: '💪' }
  ];

  const goalOptions = [
    { value: 'weight-loss', label: 'Weight Loss', icon: '📉' },
    { value: 'weight-gain', label: 'Weight Gain', icon: '📈' },
    { value: 'muscle-building', label: 'Muscle Building', icon: '💪' },
    { value: 'maintenance', label: 'Maintenance', icon: '⚖️' },
    { value: 'health-improvement', label: 'Health Improvement', icon: '❤️' }
  ];

  const cuisineOptions = [
    { value: 'american', label: 'American', icon: '🇺🇸' },
    { value: 'italian', label: 'Italian', icon: '🇮🇹' },
    { value: 'mexican', label: 'Mexican', icon: '🇲🇽' },
    { value: 'chinese', label: 'Chinese', icon: '🇨🇳' },
    { value: 'indian', label: 'Indian', icon: '🇮🇳' },
    { value: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
    { value: 'japanese', label: 'Japanese', icon: '🇯🇵' },
    { value: 'thai', label: 'Thai', icon: '🇹🇭' },
    { value: 'korean', label: 'Korean', icon: '🇰🇷' },
    { value: 'middle-eastern', label: 'Middle Eastern', icon: '🧿' }
  ];

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snacks', icon: '🍎' }
  ];

  const onSubmit = async (data) => {
    try {
      setGenerating(true);
      
      // Filter out empty ingredients
      const filteredIngredients = data.ingredients.filter(ingredient => ingredient.trim() !== '');
      
      if (filteredIngredients.length === 0) {
        toast.error('Please add at least one ingredient');
        return;
      }

      const mealPlanData = {
        ...data,
        ingredients: filteredIngredients,
        excludeIngredients: data.excludeIngredients.filter(item => item.trim() !== '')
      };

      const response = await mealPlanService.generateMealPlan(mealPlanData);
      
      toast.success('Meal plan generated successfully!');
      navigate(`/meal-plans/${response.mealPlan._id}`);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error(error.response?.data?.message || 'Failed to generate meal plan');
    } finally {
      setGenerating(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleMultiSelect = (fieldName, value) => {
    const currentValues = getValues(fieldName) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            index + 1 <= step
              ? 'bg-primary-600 text-white'
              : 'bg-dark-700 text-dark-400'
          }`}>
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${
              index + 1 < step ? 'bg-primary-600' : 'bg-dark-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const StepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What ingredients do you have?</h2>
              <p className="text-dark-300">Add the ingredients you want to use in your meal plan</p>
            </div>

            <div className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <input
                    {...register(`ingredients.${index}`, {
                      required: index === 0 ? 'At least one ingredient is required' : false
                    })}
                    className="input flex-1"
                    placeholder="e.g., chicken breast, broccoli, rice"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {errors.ingredients?.[0] && (
                <p className="form-error">{errors.ingredients[0].message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => appendIngredient('')}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Another Ingredient</span>
            </button>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                <label className="form-label">Meal Plan Duration</label>
                <select {...register('duration')} className="input w-full">
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>1 week</option>
                  <option value={14}>2 weeks</option>
                  <option value={21}>3 weeks</option>
                  <option value={30}>1 month</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Servings per meal</label>
                <select {...register('servings')} className="input w-full">
                  <option value={1}>1 person</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4 people</option>
                  <option value={6}>6 people</option>
                  <option value={8}>8 people</option>
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
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Dietary Preferences & Goals</h2>
              <p className="text-dark-300">Tell us about your dietary needs and health goals</p>
            </div>

            <div>
              <label className="form-label mb-4">Dietary Preferences</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {dietaryOptions.map(option => {
                  const isSelected = watch('dietaryPreferences')?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMultiSelect('dietaryPreferences', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label mb-4">Health Goals</label>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {goalOptions.map(option => {
                  const isSelected = watch('goals')?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMultiSelect('goals', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Preferences & Restrictions</h2>
              <p className="text-dark-300">Customize your meal plan preferences</p>
            </div>

            <div>
              <label className="form-label mb-4">Cuisine Preferences (optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {cuisineOptions.map(option => {
                  const isSelected = watch('cuisinePreferences')?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMultiSelect('cuisinePreferences', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label mb-4">Meal Types to Include</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mealTypeOptions.map(option => {
                  const isSelected = watch('mealTypes')?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMultiSelect('mealTypes', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label">Cooking Time Preference</label>
              <select {...register('cookingTime')} className="input w-full">
                <option value="minimal">Minimal (15-30 min)</option>
                <option value="moderate">Moderate (30-60 min)</option>
                <option value="extended">Extended (60+ min)</option>
              </select>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Final Review</h2>
              <p className="text-dark-300">Review your preferences and generate your meal plan</p>
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {watch('ingredients')?.filter(i => i.trim()).map((ingredient, index) => (
                    <span key={index} className="badge badge-primary">{ingredient}</span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Duration & Servings</h3>
                  <p className="text-dark-300">{watch('duration')} days, {watch('servings')} servings per meal</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Cooking Time</h3>
                  <p className="text-dark-300 capitalize">{watch('cookingTime')} preparation time</p>
                </div>
              </div>

              {watch('dietaryPreferences')?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Dietary Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {watch('dietaryPreferences').map(pref => (
                      <span key={pref} className="badge badge-secondary">{pref}</span>
                    ))}
                  </div>
                </div>
              )}

              {watch('goals')?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Health Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {watch('goals').map(goal => (
                      <span key={goal} className="badge badge-success">{goal.replace('-', ' ')}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-500 mb-1">AI Generation Notice</h4>
                  <p className="text-yellow-200 text-sm">
                    Your meal plan will be generated using AI based on your preferences. The process may take a few moments.
                  </p>
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
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-4"
          >
            <SparklesIcon className="w-5 h-5 text-primary-400" />
            <span className="text-primary-400 font-medium">AI-Powered Meal Planning</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Generate Your Perfect Meal Plan
          </h1>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto">
            Let our AI create a personalized meal plan based on your ingredients, preferences, and goals
          </p>
        </div>

        {/* Progress Indicator */}
        <StepIndicator />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-8 mb-8">
            <StepContent />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={generating}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <CpuChipIcon className="w-5 h-5" />
                    <span>Generate Meal Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
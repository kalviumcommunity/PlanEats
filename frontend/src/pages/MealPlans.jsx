import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import mealPlanService from '../services/mealplans';

const MealPlans = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    fetchMealPlans();
  }, [sortBy]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        order: 'desc'
      };
      const data = await mealPlanService.getMealPlans(params);
      setMealPlans(data.mealPlans || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;
    
    try {
      await mealPlanService.deleteMealPlan(id);
      setMealPlans(prev => prev.filter(plan => plan._id !== id));
      toast.success('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await mealPlanService.toggleFavorite(id);
      setMealPlans(prev => prev.map(plan => 
        plan._id === id 
          ? { ...plan, isFavorite: !plan.isFavorite }
          : plan
      ));
      toast.success('Meal plan updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update meal plan');
    }
  };

  const filteredMealPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'favorites') return matchesSearch && plan.isFavorite;
    if (filterStatus === 'active') return matchesSearch && plan.status === 'active';
    if (filterStatus === 'completed') return matchesSearch && plan.status === 'completed';
    
    return matchesSearch;
  });

  const MealPlanCard = ({ plan }) => {
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card hover-lift hover-glow overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 truncate">
                {plan.name || 'Meal Plan'}
              </h3>
              <p className="text-dark-300 text-sm mb-3 line-clamp-2">
                {plan.description || 'AI-generated meal plan tailored to your preferences'}
              </p>
            </div>
            <button
              onClick={() => handleToggleFavorite(plan._id)}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors ml-2"
            >
              {plan.isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-dark-400 hover:text-red-500" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <CalendarIcon className="h-4 w-4" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <UserGroupIcon className="h-4 w-4" />
              <span>{plan.servings || 1} servings</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <ClockIcon className="h-4 w-4" />
              <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`badge ${
                plan.status === 'active' ? 'badge-success' :
                plan.status === 'completed' ? 'badge-primary' :
                'badge-secondary'
              }`}>
                {plan.status || 'draft'}
              </span>
            </div>
          </div>

          {/* Meal preview */}
          {plan.meals && plan.meals.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-dark-200 mb-2">Today's Meals</h4>
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {plan.meals.slice(0, 3).map((meal, index) => (
                  <div key={index} className="flex-shrink-0 bg-dark-800 rounded-lg p-2 min-w-[120px]">
                    <div className="text-xs text-dark-400 uppercase tracking-wide">
                      {meal.type || 'Meal'}
                    </div>
                    <div className="text-sm text-white truncate">
                      {meal.name || 'Recipe'}
                    </div>
                  </div>
                ))}
                {plan.meals.length > 3 && (
                  <div className="flex-shrink-0 bg-dark-800 rounded-lg p-2 min-w-[60px] flex items-center justify-center">
                    <span className="text-xs text-dark-400">+{plan.meals.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Link
                to={`/meal-plans/${plan._id}`}
                className="btn btn-primary btn-sm"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View
              </Link>
              <button className="btn btn-secondary btn-sm">
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-primary-400">
                <ShoppingCartIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(plan._id)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="card p-12 max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <CalendarIcon className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">
          No meal plans yet
        </h3>
        <p className="text-dark-300 mb-6">
          Create your first AI-powered meal plan to get started with organized, healthy eating.
        </p>
        <Link
          to="/meal-plan-generator"
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Meal Plan
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gradient mb-4">Your Meal Plans</h1>
            <p className="text-dark-300">
              Manage and organize your AI-generated meal plans
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/meal-plan-generator"
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Plan
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search meal plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Plans</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="favorites">Favorites</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="created_at">Newest First</option>
              <option value="updated_at">Recently Updated</option>
              <option value="name">Name</option>
              <option value="start_date">Start Date</option>
            </select>

            {/* View Mode */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`btn flex-1 ${
                  viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn flex-1 ${
                  viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 mb-4"></div>
                <div className="skeleton h-4 mb-2"></div>
                <div className="skeleton h-4 mb-4 w-3/4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="skeleton h-8 w-20"></div>
                  <div className="skeleton h-8 w-20"></div>
                </div>
                <div className="skeleton h-10"></div>
              </div>
            ))}
          </div>
        ) : filteredMealPlans.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredMealPlans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MealPlanCard plan={plan} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {filteredMealPlans.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <button className="btn btn-secondary" disabled>
                Previous
              </button>
              <button className="btn btn-primary">1</button>
              <button className="btn btn-secondary" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlans;
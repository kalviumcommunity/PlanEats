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
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await mealPlanService.deleteMealPlan(id);
      setMealPlans(prev => prev.filter(plan => plan._id !== id));
      toast.success('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan');
    }
  };

  const filteredMealPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const MealPlanCard = ({ plan }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
    >
      <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center text-orange-600">
          <CalendarIcon className="h-12 w-12 mx-auto" />
          <p className="text-sm font-medium mt-2">{plan.title}</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/meal-plans/${plan._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {plan.title}
            </h3>
          </Link>
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
            {plan.status}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {plan.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{new Date(plan.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{plan.duration} days</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {plan.dietaryRestrictions.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {plan.dietaryRestrictions.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              +{plan.dietaryRestrictions.length - 2}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              to={`/meal-plans/${plan._id}`}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
            <Link
              to={`/meal-plans/${plan._id}/edit`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={() => handleDelete(plan._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          <Link
            to={`/meal-plans/${plan._id}/shopping-list`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            Shopping List
          </Link>
        </div>
      </div>
    </motion.div>
  );

  const MealPlanListItem = ({ plan }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Link to={`/meal-plans/${plan._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                {plan.title}
              </h3>
            </Link>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
              {plan.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            {plan.description}
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{plan.duration} days</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-1 text-orange-500" />
              <span>{plan.settings?.mealsPerDay || 3} meals/day</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {plan.dietaryRestrictions.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-6">
          <Link
            to={`/meal-plans/${plan._id}`}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            to={`/meal-plans/${plan._id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => handleDelete(plan._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <Link
            to={`/meal-plans/${plan._id}/shopping-list`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            List
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Meal Plans</h1>
            <p className="text-gray-600 mt-2">Manage and organize your meal plans</p>
          </div>
          
          <Link
            to="/meal-plans/generate"
            className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Plan
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search meal plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="created_at">Newest First</option>
                <option value="updated_at">Recently Updated</option>
                <option value="title">Title (A-Z)</option>
                <option value="start_date">Start Date</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredMealPlans.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No meal plans found</h3>
            <p className="text-gray-600 mb-4">Create your first meal plan to get started</p>
            <Link
              to="/meal-plans/generate"
              className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Meal Plan
            </Link>
          </div>
        ) : (
          <div className="mb-8">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMealPlans.map(plan => (
                  <MealPlanCard key={plan._id} plan={plan} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMealPlans.map(plan => (
                  <MealPlanListItem key={plan._id} plan={plan} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {mealPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Plans</h3>
              <p className="text-3xl font-bold text-orange-600">{mealPlans.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Plans</h3>
              <p className="text-3xl font-bold text-orange-600">{mealPlans.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Plans</h3>
              <p className="text-3xl font-bold text-orange-600">{mealPlans.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlans;
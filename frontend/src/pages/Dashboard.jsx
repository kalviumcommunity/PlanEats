import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  BookOpenIcon,
  UserIcon,
  ChartBarIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import mealPlanService from '../services/mealplans';
import recipeService from '../services/recipes';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState({
    recentMealPlans: [],
    favoriteRecipes: [],
    stats: {
      totalMealPlans: 0,
      activeMealPlans: 0,
      savedRecipes: 0,
      completedMealPlans: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [mealPlansData, favoritesData] = await Promise.all([
        mealPlanService.getMealPlans({ limit: 5 }),
        recipeService.getFavoriteRecipes({ limit: 6 })
      ]);

      setDashboardData({
        recentMealPlans: mealPlansData.mealPlans || [],
        favoriteRecipes: favoritesData.recipes || [],
        stats: {
          totalMealPlans: mealPlansData.total || 0,
          activeMealPlans: mealPlansData.mealPlans?.filter(mp => mp.status === 'active').length || 0,
          savedRecipes: favoritesData.total || 0,
          completedMealPlans: mealPlansData.mealPlans?.filter(mp => mp.status === 'completed').length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "orange" }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const RecentItemCard = ({ item, type }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:bg-orange-50 transition-colors duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          {type === 'meal-plan' ? (
            <CalendarIcon className="h-5 w-5 text-orange-600" />
          ) : (
            <BookOpenIcon className="h-5 w-5 text-orange-600" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">{item.title}</h4>
          <p className="text-xs text-gray-500 capitalize">{item.status || 'created recently'}</p>
        </div>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
    </motion.div>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-orange-600">{user?.profile?.firstName || user?.username}</span>
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your meal plans today.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={CalendarIcon}
            title="Total Meal Plans"
            value={dashboardData.stats.totalMealPlans}
            color="orange"
          />
          <StatCard
            icon={ClockIcon}
            title="Active Plans"
            value={dashboardData.stats.activeMealPlans}
            color="blue"
          />
          <StatCard
            icon={HeartIcon}
            title="Saved Recipes"
            value={dashboardData.stats.savedRecipes}
            color="red"
          />
          <StatCard
            icon={CheckCircleIcon}
            title="Completed"
            value={dashboardData.stats.completedMealPlans}
            color="green"
          />
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Meal Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Meal Plans</h2>
              <Link
                to="/meal-plans"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentMealPlans.length > 0 ? (
                dashboardData.recentMealPlans.map((mealPlan) => (
                  <RecentItemCard
                    key={mealPlan._id}
                    item={mealPlan}
                    type="meal-plan"
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent meal plans</p>
                  <Link
                    to="/meal-plans/generate"
                    className="inline-flex items-center mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Create Meal Plan
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Favorite Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Favorite Recipes</h2>
              <Link
                to="/recipes"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.favoriteRecipes.length > 0 ? (
                dashboardData.favoriteRecipes.map((recipe) => (
                  <RecentItemCard
                    key={recipe._id}
                    item={recipe}
                    type="recipe"
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No favorite recipes yet</p>
                  <Link
                    to="/recipes"
                    className="inline-flex items-center mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Browse Recipes
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/meal-plans/generate"
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-700 font-medium">Create Meal Plan</span>
            </Link>
            <Link
              to="/recipes"
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
            >
              <BookOpenIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">Browse Recipes</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200"
            >
              <UserIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Update Profile</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
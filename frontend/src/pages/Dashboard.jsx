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
          totalMealPlans: mealPlansData.pagination?.totalMealPlans || 0,
          activeMealPlans: mealPlansData.mealPlans?.filter(plan => plan.status === 'active').length || 0,
          savedRecipes: favoritesData.pagination?.totalRecipes || 0,
          completedMealPlans: mealPlansData.mealPlans?.filter(plan => plan.status === 'completed').length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data for demo purposes
      setDashboardData({
        recentMealPlans: [],
        favoriteRecipes: [],
        stats: {
          totalMealPlans: 0,
          activeMealPlans: 0,
          savedRecipes: 0,
          completedMealPlans: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Generate Meal Plan',
      description: 'Create a new AI-powered meal plan',
      icon: PlusIcon,
      link: '/meal-plans/generate',
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Browse Recipes',
      description: 'Discover new recipes for your meal plans',
      icon: BookOpenIcon,
      link: '/recipes',
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Your Profile',
      description: 'Update your dietary preferences',
      icon: UserIcon,
      link: '/profile',
      color: 'tertiary',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover-lift"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-dark-400'
            }`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const MealPlanCard = ({ mealPlan }) => (
    <Link
      to={`/meal-plans/${mealPlan._id}`}
      className="card p-4 hover-lift transition-all duration-300 block"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white truncate">{mealPlan.title}</h3>
        <span className={`badge ${
          mealPlan.status === 'active' ? 'badge-success' :
          mealPlan.status === 'completed' ? 'badge-primary' :
          'badge-secondary'
        }`}>
          {mealPlan.status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-dark-300">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4" />
          <span>{mealPlan.progress?.adherencePercentage || 0}% complete</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-dark-700 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${mealPlan.progress?.adherencePercentage || 0}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );

  const RecipeCard = ({ recipe }) => (
    <Link
      to={`/recipes/${recipe._id}`}
      className="card p-4 hover-lift transition-all duration-300 block"
    >
      <div className="aspect-square bg-dark-800 rounded-lg mb-3 overflow-hidden">
        {recipe.images && recipe.images.length > 0 ? (
          <img
            src={recipe.images[0]?.url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpenIcon className="w-8 h-8 text-dark-600" />
          </div>
        )}
      </div>
      <h4 className="font-medium text-white text-sm truncate mb-1">{recipe.title}</h4>
      <div className="flex items-center space-x-3 text-xs text-dark-400">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-3 h-3" />
          <span>{recipe.prepTime + recipe.cookTime}m</span>
        </div>
        <div className="flex items-center space-x-1">
          <HeartIcon className="w-3 h-3" />
          <span>{recipe.favorites || 0}</span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-dark-800 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-16 bg-dark-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gradient">
            Welcome back, {user?.profile?.firstName || user?.username}!
          </h1>
          <p className="text-dark-300 text-lg">
            Here's your meal planning dashboard
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="card p-6 hover-lift hover-glow transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-dark-300">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Meal Plans"
              value={dashboardData.stats.totalMealPlans}
              icon={CalendarIcon}
              color="primary"
              change={12}
            />
            <StatCard
              title="Active Plans"
              value={dashboardData.stats.activeMealPlans}
              icon={FireIcon}
              color="secondary"
              change={5}
            />
            <StatCard
              title="Saved Recipes"
              value={dashboardData.stats.savedRecipes}
              icon={HeartIcon}
              color="red"
              change={-2}
            />
            <StatCard
              title="Completed Plans"
              value={dashboardData.stats.completedMealPlans}
              icon={TrophyIcon}
              color="green"
              change={8}
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Meal Plans */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Recent Meal Plans</h2>
              <Link to="/meal-plans" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {dashboardData.recentMealPlans.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentMealPlans.map(mealPlan => (
                  <MealPlanCard key={mealPlan._id} mealPlan={mealPlan} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-300 mb-2">No meal plans yet</h3>
                <p className="text-dark-400 mb-4">Create your first AI-powered meal plan to get started!</p>
                <Link to="/meal-plans/generate" className="btn-primary">
                  Generate Meal Plan
                </Link>
              </div>
            )}
          </motion.div>

          {/* Favorite Recipes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Favorite Recipes</h2>
              <Link to="/recipes" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                Browse More
              </Link>
            </div>
            
            {dashboardData.favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dashboardData.favoriteRecipes.map(recipe => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <HeartIcon className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-300 mb-2">No favorite recipes yet</h3>
                <p className="text-dark-400 mb-4">Start browsing recipes and save your favorites!</p>
                <Link to="/recipes" className="btn-secondary">
                  Browse Recipes
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Keep up the great work!</h3>
              <p className="text-dark-300">You're building healthy eating habits. Complete your active meal plans to unlock new achievements.</p>
            </div>
            <Link to="/meal-plans" className="btn-primary">
              View Plans
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
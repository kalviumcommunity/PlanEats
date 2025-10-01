import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Welcome back, {user?.profile?.firstName || user?.username}!
            </h1>
            <p className="text-dark-300">
              Here's your meal planning dashboard
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4">Generate Meal Plan</h3>
              <p className="text-dark-300 mb-4">Create a new AI-powered meal plan</p>
              <button className="btn-primary w-full">Start Planning</button>
            </div>
            
            <div className="card p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4">Browse Recipes</h3>
              <p className="text-dark-300 mb-4">Discover new recipes for your meal plans</p>
              <button className="btn-secondary w-full">View Recipes</button>
            </div>
            
            <div className="card p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
              <p className="text-dark-300 mb-4">Update your dietary preferences</p>
              <button className="btn-secondary w-full">Edit Profile</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">5</div>
              <div className="text-dark-300">Active Meal Plans</div>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-secondary-400 mb-2">23</div>
              <div className="text-dark-300">Saved Recipes</div>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">156</div>
              <div className="text-dark-300">Meals Planned</div>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-secondary-400 mb-2">89%</div>
              <div className="text-dark-300">Goal Progress</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
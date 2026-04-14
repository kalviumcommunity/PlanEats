import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Utensils, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import adminService from '../../services/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AdminLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-gray-400 mt-1">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/admin/recipes" 
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-bold transition-all"
            >
              <Plus size={18} />
              Verify Recipes
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats?.users.total || 0}
            icon={<Users className="text-blue-500" />}
            trend={{ value: stats?.users.newLast7Days, label: 'new this week' }}
            color="blue"
          />
          <StatCard 
            title="Active Users" 
            value={stats?.users.active || 0}
            icon={<CheckCircle className="text-green-500" />}
            trend={{ value: '88%', label: 'activity rate' }}
            color="green"
          />
          <StatCard 
            title="Total Recipes" 
            value={stats?.recipes.total || 0}
            icon={<Utensils className="text-orange-500" />}
            trend={{ value: stats?.recipes.pending, label: 'pending review', warning: true }}
            color="orange"
          />
          <StatCard 
            title="Meal Plans" 
            value={stats?.mealPlans.total || 0}
            icon={<Clock className="text-purple-500" />}
            trend={{ value: '+14', label: 'last 24h' }}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart/Visual Section (Placeholder for simplified view) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-yellow-500" size={20} />
                User Engagement
              </h3>
              <Link to="/admin/analytics" className="text-yellow-500 text-sm font-medium hover:underline">
                View detailed analytics
              </Link>
            </div>
            
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-yellow-500/10 rounded-full">
                <BarChart3 size={48} className="text-yellow-500" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Growth Visualization</h4>
                <p className="text-gray-400 max-w-xs mx-auto text-sm">
                  User registrations are up by 24% compared to last month. Check the analytics tab for a full breakdown.
                </p>
              </div>
              <Link to="/admin/analytics" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-all">
                Launch Analytics Engine
              </Link>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
            <div className="space-y-6">
              <StatusItem 
                label="API Server" 
                status="healthy" 
                detail="Latency: 42ms" 
              />
              <StatusItem 
                label="Database" 
                status="healthy" 
                detail="98.2% Storage Free" 
              />
              <StatusItem 
                label="Image Storage" 
                status="warning" 
                detail="High Usage detected" 
              />
              <StatusItem 
                label="Notifications" 
                status="healthy" 
                detail="Queue empty" 
              />
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <h4 className="text-white font-bold mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <ActionButton to="/admin/users" label="Audit Users" icon={<Users size={16} />} />
                <ActionButton to="/admin/recipes" label="Moderation" icon={<AlertCircle size={16} />} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, trend, color }) => {
  return (
    <motion.div
      variants={{
        hidden: { scale: 0.95, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
      }}
      className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 transition-all hover:border-gray-700 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gray-800 transition-colors group-hover:bg-gray-700`}>
          {icon}
        </div>
        <div className={`p-1.5 rounded-lg text-xs font-bold ${trend.warning ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500 flex items-center gap-1'}`}>
          {!trend.warning && <ArrowUpRight size={14} />}
          {trend.value}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{trend.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

const StatusItem = ({ label, status, detail }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'}`} />
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-[10px]">{detail}</p>
      </div>
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`}>
      {status}
    </span>
  </div>
);

const ActionButton = ({ to, label, icon }) => (
  <Link 
    to={to} 
    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
  >
    {icon}
    {label}
  </Link>
);

const BarChart3 = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M7 16h4" />
    <path d="M7 12h8" />
    <path d="M7 8h12" />
  </svg>
);

export default AdminDashboard;

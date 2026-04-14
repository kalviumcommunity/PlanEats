import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { TrendingUp, Users, Utensils, Award, Calendar, Search } from 'lucide-react';
import adminService from '../../services/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminService.getAnalytics({ period });
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
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

  const userGrowthData = data?.userGrowth.map(item => ({
    date: `${item._id.day}/${item._id.month}`,
    users: item.count
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
            <p className="text-gray-400">Deep dive into PlanEats performance and growth</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            {['7', '14', '30', '90'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  period === p 
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {p} Days
              </button>
            ))}
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="User Growth" 
            value={`+${data?.userGrowth.reduce((acc, curr) => acc + curr.count, 0)}`} 
            icon={<Users className="w-6 h-6" />}
            trend="+12% from last period"
            color="blue"
            delay={0}
          />
          <StatCard 
            title="Top Cuisine" 
            value={data?.cuisineDistribution[0]?._id || 'N/A'} 
            icon={<Utensils className="w-6 h-6" />}
            trend={`${data?.cuisineDistribution[0]?.count || 0} recipes`}
            color="orange"
            delay={0.1}
          />
          <StatCard 
            title="Total Verified" 
            value={data?.popularRecipes.length || 0} 
            icon={<Award className="w-6 h-6" />}
            trend="High engagement"
            color="green"
            delay={0.2}
          />
          <StatCard 
            title="Record Period" 
            value={`${period} Days`} 
            icon={<Calendar className="w-6 h-6" />}
            trend="Active monitoring"
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              User Registration Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#F59E0B' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cuisine Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-400" />
              Cuisine Popularity
            </h3>
            <div className="h-[300px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.cuisineDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {data?.cuisineDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dietary Tags Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Dietary Tags Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dietaryTagsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="_id" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Popular Recipes Table-style Analytics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Top Performing Recipes</h3>
            <div className="space-y-4">
              {data?.popularRecipes.map((recipe, idx) => (
                <div key={recipe._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-white font-medium text-sm">{recipe.title}</h4>
                      <p className="text-gray-500 text-xs">by {recipe.author.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500 font-bold text-sm">{recipe.views || 0}</div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Views</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, trend, color, delay }) => {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover-glow transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white leading-none">{value}</h3>
          <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;

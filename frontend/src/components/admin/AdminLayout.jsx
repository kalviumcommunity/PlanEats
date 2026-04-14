import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/recipes', label: 'Recipes', icon: <Utensils size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800/50">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
              <Utensils className="text-black" size={24} />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              >
                PlanEats
              </motion.span>
            )}
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`${isActive ? 'text-black' : 'text-yellow-500/80 group-hover:text-yellow-500 transition-colors'}`}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 w-1 h-5 bg-black rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all ${
              !isSidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-black/50 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">Admin</span>
              <ChevronRight size={14} />
              <span className="text-white font-medium capitalize">
                {location.pathname.split('/').pop().replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="hidden sm:flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-full px-4 py-2 w-64 focus-within:border-yellow-500/50 transition-all">
              <Search size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none text-sm focus:outline-none w-full text-gray-200"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-black"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium text-white">{user?.username}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-yellow-500">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black p-6 md:p-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Utensils size={18} className="text-black" />
                  </div>
                  <span className="text-xl font-bold">PlanEats</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 py-8 px-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.path 
                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/5 transition-all text-left"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4B5563;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;

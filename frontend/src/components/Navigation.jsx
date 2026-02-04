import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const NavItems = ({ mobile = false }) => (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `px-3 py-2 text-sm font-medium ${
            isActive 
              ? 'text-orange-600 bg-orange-50 border border-orange-200' 
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          } rounded-lg transition-colors ${mobile ? 'block' : ''}`
        }
        onClick={() => mobile && setIsOpen(false)}
      >
        Home
      </NavLink>
      <NavLink
        to="/recipes"
        className={({ isActive }) =>
          `px-3 py-2 text-sm font-medium ${
            isActive 
              ? 'text-orange-600 bg-orange-50 border border-orange-200' 
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          } rounded-lg transition-colors ${mobile ? 'block' : ''}`
        }
        onClick={() => mobile && setIsOpen(false)}
      >
        Recipes
      </NavLink>
      {isAuthenticated() && (
        <>
          <NavLink
            to="/meal-plans"
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium ${
                isActive 
                  ? 'text-orange-600 bg-orange-50 border border-orange-200' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              } rounded-lg transition-colors ${mobile ? 'block' : ''}`
            }
            onClick={() => mobile && setIsOpen(false)}
          >
            Meal Plans
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium ${
                isActive 
                  ? 'text-orange-600 bg-orange-50 border border-orange-200' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              } rounded-lg transition-colors ${mobile ? 'block' : ''}`
            }
            onClick={() => mobile && setIsOpen(false)}
          >
            Dashboard
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PE</span>
            </div>
            <span className="text-orange-600 text-xl font-bold hidden sm:block">
              PlanEats AI
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItems />
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    {user?.profile?.firstName || user?.username}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                  >
                    <NavLink
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3 text-orange-500" />
                      Profile Settings
                    </NavLink>
                    <hr className="border-gray-200 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-orange-500" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Sign In
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm border border-transparent transition-all duration-300"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6 text-orange-600" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-orange-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-2">
              <NavItems mobile />
              
              {/* Mobile Auth Section */}
              <hr className="border-gray-200 my-2" />
              {isAuthenticated() ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">
                      {user?.profile?.firstName || user?.username}
                    </span>
                  </div>
                  <NavLink
                    to="/profile"
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg block"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg block text-left w-full"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <NavLink
                    to="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg block"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm border border-transparent transition-all duration-300 block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
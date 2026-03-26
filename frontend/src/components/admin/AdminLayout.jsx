import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/recipes', label: 'Recipes', icon: '🍳' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-orange-600">PlanEats Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-orange-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.username}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Admin
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="sm:hidden bg-white border-b">
        <div className="flex space-x-4 px-4 py-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

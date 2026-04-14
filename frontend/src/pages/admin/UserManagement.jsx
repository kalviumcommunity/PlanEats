import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldAlert,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(filters);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      await adminService.updateUser(userId, updateData);
      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const toggleUserStatus = (user) => {
    handleUpdateUser(user._id, { isActive: !user.isActive });
  };

  const toggleAdminRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    handleUpdateUser(user._id, { role: newRole, isAdmin: newRole === 'admin' });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">Manage platform access, roles, and user profiles.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-800 text-white rounded-xl font-bold border border-gray-700 hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by username or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-600"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/30 border border-gray-800 rounded-xl">
              <Shield size={16} className="text-gray-500" />
              <select 
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-gray-300 py-2 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-black/30 border border-gray-800 rounded-xl">
              <Filter size={16} className="text-gray-500" />
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-gray-300 py-2 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-800">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                              <span className="text-yellow-500 font-bold uppercase">{user.username?.[0]}</span>
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm tracking-tight">{user.username}</div>
                              <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                <Calendar size={12} />
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-300 text-sm flex items-center gap-2">
                            <Mail size={14} className="text-gray-600" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                            <span className={`text-xs font-medium ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleUserStatus(user)}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                              className={`p-2 rounded-lg transition-all ${
                                user.isActive ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                              }`}
                            >
                              {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                            </button>
                            <button 
                              onClick={() => toggleAdminRole(user)}
                              title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
                            >
                              {user.role === 'admin' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              title="Delete User"
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-20 text-center">
                  <Users className="mx-auto text-gray-800 mb-4" size={48} />
                  <h3 className="text-white font-bold">No users found</h3>
                  <p className="text-gray-500 text-sm">Adjust your filters or try a different search term.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-white/5 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Showing <span className="text-gray-300 font-bold">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to <span className="text-gray-300 font-bold">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span> of <span className="text-white font-bold">{pagination.total}</span> users
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={!pagination.hasPrev}
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  className="p-2 bg-black/40 border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handleFilterChange('page', i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pagination.currentPage === i + 1 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-black/40 text-gray-500 hover:text-white border border-gray-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={!pagination.hasNext}
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  className="p-2 bg-black/40 border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  ChefHat,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const RecipeModeration = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingRecipes();
  }, [pagination.currentPage]);

  const fetchPendingRecipes = async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminService.getPendingRecipes({ page, limit: 12 });
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching pending recipes:', error);
      toast.error('Failed to load pending recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (recipeId, isVerified) => {
    try {
      if (!isVerified && !rejectionReason.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }

      await adminService.verifyRecipe(recipeId, isVerified, rejectionReason);
      toast.success(isVerified ? 'Recipe approved!' : 'Recipe rejected');
      setShowModal(false);
      setRejectionReason('');
      fetchPendingRecipes(pagination.currentPage);
    } catch (error) {
      console.error('Error verifying recipe:', error);
      toast.error('Failed to process moderation');
    }
  };

  const openVerificationModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    setRejectionReason('');
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Recipe Moderation</h1>
            <p className="text-gray-400 mt-1">Review user-submitted recipes for platform compliance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-bold ${
              pagination.total > 0 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
            }`}>
              {pagination.total || 0} Pending Review
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : recipes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/40 border border-gray-800 rounded-3xl p-20 text-center"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Inbox Zero!</h2>
            <p className="text-gray-500 max-w-sm mx-auto">All recipes have been reviewed. Good job keeping the platform clean.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {recipes.map((recipe, idx) => (
                <motion.div
                  key={recipe._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group"
                >
                  {/* Recipe Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={recipe.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                      <Clock size={12} className="text-yellow-500" />
                      Pending Review
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-yellow-500 transition-colors uppercase tracking-tight">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <ChefHat size={14} className="text-orange-500" />
                        {recipe.cuisine} • {recipe.difficulty}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {recipe.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-gray-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                          <User size={14} className="text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-300 font-bold">{recipe.author?.username || 'Unknown'}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(recipe.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link 
                        to={`/recipes/${recipe._id}`} 
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-gray-700 shadow-xl"
                      >
                        <Eye size={16} />
                        Preview
                      </Link>
                      <button 
                        onClick={() => openVerificationModal(recipe)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-yellow-500/20"
                      >
                        <CheckCircle2 size={16} />
                        Moderate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-3">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => fetchPendingRecipes(pagination.currentPage - 1)}
              className="px-6 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl disabled:opacity-30 transition-all flex items-center gap-2 font-bold text-sm"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="flex gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchPendingRecipes(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    pagination.currentPage === i + 1 
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                      : 'bg-gray-900 text-gray-500 border border-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchPendingRecipes(pagination.currentPage + 1)}
              className="px-6 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl disabled:opacity-30 transition-all flex items-center gap-2 font-bold text-sm"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      <AnimatePresence>
        {showModal && selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Modal UI (Simplified) */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={selectedRecipe.images?.[0]?.url || 'https://via.placeholder.com/800x600?text=Recipe+Image'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{selectedRecipe.title}</h2>
                  <p className="text-yellow-500 text-sm font-bold">{selectedRecipe.cuisine} • Submitted by {selectedRecipe.author?.username}</p>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto bg-[#0a0a0a]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Moderation Hub</span>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                      <XCircle size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                        <ChefHat size={14} className="text-orange-500" /> Ingredients Overview
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.ingredients?.slice(0, 6).map((ing, i) => (
                          <span key={i} className="text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300">
                            {ing.name}
                          </span>
                        ))}
                        {selectedRecipe.ingredients?.length > 6 && (
                          <span className="text-[10px] text-gray-600 font-bold self-center">+{selectedRecipe.ingredients.length - 6} MORE</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Rejection Feedback
                      </h4>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Why is this recipe being rejected? (Mandatory for rejections)"
                        className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700"
                        rows={4}
                      />
                      <p className="text-[10px] text-gray-600 mt-2 italic">* This message will be sent to the author.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => handleVerify(selectedRecipe._id, false)}
                    className="flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20"
                  >
                    <XCircle size={18} /> Reject Submission
                  </button>
                  <button
                    onClick={() => handleVerify(selectedRecipe._id, true)}
                    className="flex items-center justify-center gap-3 py-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20"
                  >
                    <CheckCircle2 size={18} /> Approve & Publish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default RecipeModeration;

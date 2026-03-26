import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

      await adminService.verifyRecipe(recipeId, isVerified, rejectionReason || '');
      toast.success(isVerified ? 'Recipe verified!' : 'Recipe rejected');
      setShowModal(false);
      setRejectionReason('');
      fetchPendingRecipes(pagination.currentPage);
    } catch (error) {
      console.error('Error verifying recipe:', error);
      toast.error('Failed to verify recipe');
    }
  };

  const openVerificationModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    setRejectionReason('');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recipe Moderation</h2>
          <p className="mt-2 text-sm text-gray-600">
            Review and verify user-submitted recipes
          </p>
        </div>

        {/* Stats */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">{pagination.total || 0}</span> recipes pending review
              </p>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending recipes</h3>
            <p className="mt-1 text-sm text-gray-500">All recipes have been reviewed!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Recipe Image */}
                <div className="h-48 bg-gray-200 relative">
                  {recipe.images?.[0]?.url ? (
                    <img
                      src={recipe.images[0].url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {recipe.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {recipe.cuisine}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded capitalize">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                    <span>🍽️ {recipe.servings} servings</span>
                  </div>

                  {/* Author Info */}
                  {recipe.author && (
                    <div className="mb-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Submitted by:</p>
                      <p className="text-sm font-medium text-gray-700">{recipe.author.username}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/recipes/${recipe._id}`}
                      target="_blank"
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 text-center"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => openVerificationModal(recipe)}
                      className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => fetchPendingRecipes(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchPendingRecipes(page)}
                  className={`px-4 py-2 border rounded-md ${
                    pagination.currentPage === page
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => fetchPendingRecipes(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Review Recipe: {selectedRecipe.title}
              </h3>

              <div className="space-y-4">
                {/* Recipe Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedRecipe.ingredients?.slice(0, 5).map((ing, idx) => (
                      <li key={idx}>
                        {ing.amount} {ing.unit} {ing.name}
                      </li>
                    ))}
                    {selectedRecipe.ingredients?.length > 5 && (
                      <li className="text-gray-400">+{selectedRecipe.ingredients.length - 5} more...</li>
                    )}
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <ol className="list-decimal list-inside text-gray-600">
                    {selectedRecipe.instructions?.slice(0, 3).map((inst, idx) => (
                      <li key={idx} className="mb-1">{inst.description}</li>
                    ))}
                    {selectedRecipe.instructions?.length > 3 && (
                      <li className="text-gray-400">+{selectedRecipe.instructions.length - 3} more steps...</li>
                    )}
                  </ol>
                </div>

                {!selectedRecipe.isVerified && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this recipe should be rejected..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(selectedRecipe._id, false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerify(selectedRecipe._id, true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RecipeModeration;

import { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Label } from '../../label';
import { Card } from '../../card';
import { Star, Upload, X, Search, Filter, Eye, Trash2, Edit, MessageCircle } from 'lucide-react';
import ReviewDetailModal from './ReviewDetailModal';
import { toast } from 'react-hot-toast';
import Pagination from "@/components/Layout/Pagination";

const ReviewManagement = ({ userToken, isAdmin = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    target_type: '',
    min_rating: '',
    max_rating: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalOptions, setModalOptions] = useState({ openReply: false, allowReply: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  // Create review is disabled on dashboard per request

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      // Add filters with exact rating logic
      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        if (key === 'min_rating') {
          queryParams.append('min_rating', value);
          queryParams.append('max_rating', value);
          return;
        }
        if (key === 'max_rating') return; // managed by min_rating exact logic
        if (key === 'target_type') return; // remove type filter per requirement
        queryParams.append(key, value);
      });

      const headers = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`http://localhost:3000/api/reviews/manage?${queryParams}`, {
        headers
      });

      const result = await response.json();

      if (response.ok) {
        setReviews(result.data.reviews || []);
        setPagination(result.data.pagination || {});
      } else {
        toast.error(result.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('An error occurred while fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  // Search reviews
  const searchReviews = async () => {
    if (!searchQuery.trim()) {
      fetchReviews();
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        page: filters.page,
        limit: filters.limit
      });

      const headers = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`http://localhost:3000/api/reviews/manage/search?${queryParams}`, {
        headers
      });

      const result = await response.json();

      if (response.ok) {
        setReviews(result.data.reviews || []);
        setPagination(result.data.pagination || {});
      } else {
        toast.error(result.message || 'Failed to search reviews');
      }
    } catch (error) {
      console.error('Error searching reviews:', error);
      toast.error('An error occurred while searching reviews');
    } finally {
      setLoading(false);
    }
  };

  // Delete/Hide review
  const handleDeleteReview = async (reviewId) => {
    try {
      const headers = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();

      if (response.ok) {
        const status = result?.data?.status;
        if (status === 'hidden') {
          toast.success('Review hidden successfully');
        } else if (status === 'deleted') {
          toast.success('Review deleted successfully');
        } else {
          toast.success(result.message || 'Review updated');
        }
        fetchReviews(); // Refresh the list
        setShowDeleteModal(false);
        setReviewToDelete(null);
      } else {
        toast.error(result.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('An error occurred while deleting the review');
    }
  };

  // View review detail
  const handleViewDetail = async (reviewId, opts = { openReply: false, allowReply: false }) => {
    try {
      const headers = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        headers
      });

      const result = await response.json();

      if (response.ok) {
        setSelectedReview(result.data);
        setModalOptions({ openReply: !!opts.openReply, allowReply: !!opts.allowReply });
        setShowDetailModal(true);
      } else {
        toast.error(result.message || 'Failed to fetch review details');
      }
    } catch (error) {
      console.error('Error fetching review detail:', error);
      toast.error('An error occurred while fetching review details');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    if (key === 'min_rating') {
      // exact rating: mirror to max_rating
      setFilters(prev => ({ ...prev, min_rating: value, max_rating: value, page: 1 }));
      return;
    }
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchReviews();
      } else {
        fetchReviews();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Review Management</h1>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.min_rating}
              onChange={(e) => handleFilterChange('min_rating', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>

            {isAdmin && (
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            )}
          </div>
        </div>
      </Card>

      {/* Reviews Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Comment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created At</th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review, index) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {pagination.items_per_page * (pagination.current_page - 1) + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">Product</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {review.user_id?.name || 'Unknown User'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {review.content || review.title || 'No comment'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-xs text-gray-500">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {review.images && review.images.length > 0 ? (
                        <img
                          src={review.images[0]}
                          alt="Review"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(review.created_at)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {review.status || 'visible'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(review._id, { openReply: false, allowReply: false })}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(review._id, { openReply: true, allowReply: true })}
                          className="text-green-600 hover:text-green-800"
                          title="Reply"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setReviewToDelete(review);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title={review.status === 'hidden' ? 'Unhide Review' : 'Hide Review'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={filters.page}
          totalPages={pagination.total_pages || pagination.totalPages || 1}
          onPageChange={handlePageChange}
        />

      </Card>

      {/* Review Detail Modal - reuse component with reply support */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto">
            <ReviewDetailModal
              reviewId={selectedReview._id}
              isOpen={true}
              onClose={() => {
                setShowDetailModal(false);
                setModalOptions({ openReply: false, allowReply: false });
                setSelectedReview(null);
              }}
              userToken={userToken}
              onReplyCreated={() => fetchReviews()}
              allowReply={modalOptions.allowReply}
              openReply={modalOptions.openReply}
              showReplies={false}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reviewToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {reviewToDelete?.status === 'hidden' ? 'Unhide this review?' : 'Hide this review?'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                "{reviewToDelete.content || reviewToDelete.title || 'No comment'}"
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setReviewToDelete(null);
                  }}
                >
                  No
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteReview(reviewToDelete._id)}
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Review disabled on dashboard */}
    </div>
  );
};

export default ReviewManagement;

import { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Card } from '../../card';
import { Star, Filter, ChevronDown } from 'lucide-react';
import ReviewCard from './ReviewCard';
import CreateReviewForm from './CreateReviewForm';
import EditReviewForm from './EditReviewForm';
import ReviewDetailModal from './ReviewDetailModal';
import API_BASE_URL from '@/config/api';

const ReviewList = ({ 
  productId, 
  productType = 'product',
  userToken,
  currentUserId,
  showCreateForm = true,
  allowReply = true 
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    min_rating: '',
    max_rating: '',
    page: 1,
    limit: 5
  });
  const [pagination, setPagination] = useState({});
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch reviews for this product/service
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        target_type: productType,
        target_id: productId,
        page: filters.page,
        limit: filters.limit
      });

      // Add rating filters
      if (filters.min_rating) queryParams.append('min_rating', filters.min_rating);
      if (filters.max_rating) queryParams.append('max_rating', filters.max_rating);

      const response = await fetch(`${API_BASE_URL}/reviews?${queryParams}`, {
        headers: userToken ? {
          'Authorization': `Bearer ${userToken}`
        } : {}
      });

      const result = await response.json();
      
      if (response.ok) {
        setReviews(result.data.reviews || []);
        setPagination(result.data.pagination || {});
      } else {
        console.error('Failed to fetch reviews:', result.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle review creation
  const handleReviewCreated = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowCreateReview(false);
    // Update pagination
    setPagination(prev => ({
      ...prev,
      total_items: prev.total_items + 1
    }));
  };

  // Handle review update
  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev => 
      prev.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );
    setEditingReview(null);
  };

  // Handle review deletion
  const handleReviewDeleted = async (reviewOrId) => {
    try {
      const reviewId = typeof reviewOrId === 'string' ? reviewOrId : reviewOrId._id;
      if (!reviewId) return;

      const confirmMsg = 'Do you want to hide/unhide this review?';
      if (!window.confirm(confirmMsg)) return;

      const headers = userToken ? { 'Authorization': `Bearer ${userToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers
      });
      const result = await response.json();
      if (response.ok) {
        const updated = result.data;
        if (updated && updated._id) {
          setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));
        } else {
          // If API returns no body, refetch
          fetchReviews();
        }
      } else {
        console.error('Failed to update review visibility:', result.message);
      }
    } catch (e) {
      console.error('Error deleting/hiding review:', e);
    }
  };

  // Handle reply creation
  const handleReplyCreated = (newReply) => {
    // Update replies count for the review
    setReviews(prev => 
      prev.map(review => 
        review._id === newReply.review_id 
          ? { ...review, replies_count: (review.replies_count || 0) + 1 }
          : review
      )
    );
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, filters]);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const distribution = [5, 4, 3, 2, 1].map(rating => {
      const count = reviews.filter(review => review.rating === rating).length;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return { rating, count, percentage };
    });

    return (
      <div className="space-y-2">
        {distribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm w-8">{rating}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12">{count}</span>
          </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card className="p-6 bg-yellow-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-orange-600 mb-2">
              {reviews.length === 0 ? 'No rating yet' : `${averageRating.toFixed(1)} out of 5`}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-blue-600 underline cursor-pointer">
              {reviews.length} {reviews.length === 1 ? 'Rating' : 'Ratings'}
            </p>
          </div>
          <div className="w-48">
            <h4 className="font-semibold mb-3">Rating Distribution</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </Card>

      {/* Create Review Form - Only for authenticated users */}
      {showCreateForm && userToken && (
        <div>
          {!showCreateReview ? (
            <Button
              onClick={() => setShowCreateReview(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add a Review
            </Button>
          ) : (
            <CreateReviewForm
              productId={productId}
              productType={productType}
              userToken={userToken}
              onReviewCreated={handleReviewCreated}
              onCancel={() => setShowCreateReview(false)}
            />
          )}
        </div>
      )}

      {/* Show login prompt for guests */}
      {showCreateForm && !userToken && (
        <Card className="p-4 text-center">
          <p className="text-gray-600 mb-3">
            Please <a href="/login" className="text-blue-600 hover:underline">login</a> to write a review
          </p>
        </Card>
      )}

      {/* Filters - always visible to avoid disappearing when result is empty */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </h4>
          <div className="flex gap-2">
            <Button
              variant={filters.min_rating === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('min_rating', '')}
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={filters.min_rating === rating.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('min_rating', rating.toString())}
                className="flex items-center gap-1"
              >
                {rating} ★
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No reviews yet. Be the first to review this {productType}!
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              userToken={userToken}
              currentUserId={currentUserId}
              currentUserRole={(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('user'));
                  return u?.role || u?.user?.role || null;
                } catch { return null; }
              })()}
              onEdit={setEditingReview}
              onDelete={() => handleReviewDeleted(review)}
              onReply={(review) => {
                setSelectedReview(review);
                setShowDetailModal(true);
              }}
              allowReply={allowReply}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.total_pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <EditReviewForm
              reviewId={editingReview._id}
              userToken={userToken}
              onReviewUpdated={handleReviewUpdated}
              onCancel={() => setEditingReview(null)}
            />
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      <ReviewDetailModal
        reviewId={selectedReview?._id}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReview(null);
        }}
        userToken={userToken}
        onReplyCreated={handleReplyCreated}
        openReply={false}
      />
    </div>
  );
};

export default ReviewList;

import { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Card } from '../../card';
import { Star, MessageCircle, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '@/config/api';

const ReviewCard = ({ 
  review, 
  userToken, 
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
  onReply,
  showActions = true,
  allowReply = true
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes || 0);
  const [repliesCount, setRepliesCount] = useState(review.replies_count || 0);
  const [isReplyingInline, setIsReplyingInline] = useState(false);
  const [inlineReply, setInlineReply] = useState('');
  const [isPostingInline, setIsPostingInline] = useState(false);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    // TODO: Implement like functionality
    // For now, just toggle local state
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleEdit = () => {
    onEdit?.(review);
  };

  const handleDelete = () => {
    onDelete?.(review);
  };

  const handleReply = () => {
    onReply?.(review);
  };

  const submitInlineReply = async () => {
    if (!inlineReply.trim()) return;
    try {
      setIsPostingInline(true);
      const response = await fetch(`${API_BASE_URL}/reviews/${review._id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify({ content: inlineReply.trim() })
      });
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };
      if (response.ok) {
        toast.success('Reply posted');
        setInlineReply('');
        setIsReplyingInline(false);
        setRepliesCount((repliesCount || 0) + 1);
      } else {
        toast.error(result.message || 'Failed to post reply');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error posting reply');
    } finally {
      setIsPostingInline(false);
    }
  };

  const isOwner = currentUserId && review.user_id?._id === currentUserId;
  const isAdmin = currentUserRole && typeof currentUserRole === 'string' && currentUserRole.toLowerCase() === 'admin';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {review.user_id?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.user_id?.name || 'Anonymous User'}
              </h4>
              <p className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>

          {/* Actions for owner - only show if user is authenticated */}
          {showActions && userToken && (isOwner || isAdmin) && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit Review"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
          <span className="text-sm text-gray-600">
            {review.rating} out of 5 stars
          </span>
        </div>

        {/* Title */}
        {review.title && (
          <h5 className="font-medium text-lg text-gray-900">
            {review.title}
          </h5>
        )}

        {/* Content */}
        <div className="text-gray-700 leading-relaxed">
          {review.content || 'No content provided'}
        </div>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {review.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
            {review.images.length > 3 && (
              <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
                +{review.images.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                isLiked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>

            {/* Reply Button (dashboard) OR inline reply (homepage) */}
            {userToken && allowReply && (
              <button
                onClick={handleReply}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Product/Service Info */}
          <div className="text-xs text-gray-500">
            {review.target_type === 'product' ? 'Product Review' : 'Service Review'}
          </div>
        </div>

        {/* View replies link for homepage */}
        {!allowReply && (
          <div className="pt-2">
            <button
              onClick={handleReply}
              className="text-blue-600 hover:underline text-sm"
            >
              View Replies
            </button>
          </div>
        )}

        {/* Inline reply box on homepage when user clicks Reply */}
        {!allowReply && userToken && (
          <div className="pt-2">
            {!isReplyingInline ? (
              <button
                onClick={() => setIsReplyingInline(true)}
                className="text-gray-600 hover:underline text-sm"
              >
                Reply
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <textarea
                    value={inlineReply}
                    onChange={(e) => setInlineReply(e.target.value)}
                    placeholder={`@${review.user_id?.name || 'user'} `}
                    className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    maxLength={500}
                  />
                  <button
                    onClick={submitInlineReply}
                    disabled={isPostingInline || !inlineReply.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  >
                    {isPostingInline ? 'Posting...' : 'Submit Reply'}
                  </button>
                </div>
                <button
                  onClick={() => { setIsReplyingInline(false); setInlineReply(''); }}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewCard;

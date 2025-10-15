import { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Label } from '../../label';
import { Card } from '../../card';
import { Star, MessageCircle, Send, X, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '@/config/api';

const ReviewDetailModal = ({
  reviewId,
  isOpen,
  onClose,
  userToken,
  onReplyCreated,
  openReply = false,
  allowReply = true,
  showReplies = true
}) => {
  const [review, setReview] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Fetch review details
  useEffect(() => {
    if (isOpen && reviewId) {
      fetchReviewDetails();
      setShowReplyForm(!!openReply);
    }
  }, [isOpen, reviewId, openReply]);

  const fetchReviewDetails = async () => {
    setLoading(true);
    try {
      const [reviewResponse, repliesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }),
        fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        })
      ]);

      const ct1 = reviewResponse.headers.get('content-type') || '';
      const ct2 = repliesResponse.headers.get('content-type') || '';
      const reviewResult = ct1.includes('application/json') ? await reviewResponse.json() : { message: await reviewResponse.text() };
      const repliesResult = ct2.includes('application/json') ? await repliesResponse.json() : { message: await repliesResponse.text() };

      if (reviewResponse.ok) {
        setReview(reviewResult.data);
      } else {
        toast.error(reviewResult.message || 'Failed to fetch review');
      }

      if (repliesResponse.ok) {
        setReplies(repliesResult.data.replies || []);
      } else {
        toast.error(repliesResult.message || 'Failed to fetch replies');
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      toast.error('An error occurred while fetching review details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error('Please write a reply');
      return;
    }

    setIsSubmittingReply(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          content: replyContent.trim()
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };

      if (response.ok) {
        toast.success('Reply posted successfully!');
        setReplyContent('');
        setShowReplyForm(false);
        onReplyCreated?.(result.data);
        // Refresh replies
        fetchReviewDetails();
      } else {
        toast.error(result.message || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('An error occurred while posting the reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

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
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Review Detail</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : review ? (
          <div className="space-y-6">
            {/* Review Content */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600">
                      {review.user_id?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {review.user_id?.email || 'No email'}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </div>
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
                  <div>
                    <h4 className="font-medium text-lg">{review.title}</h4>
                  </div>
                )}

                {/* Content */}
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.content || 'No content provided'}
                  </p>
                </div>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Images:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Replies Section */}
            <div>
              {/* Reply Form - only for authenticated users */}
              {allowReply && userToken && (
                <div className="flex justify-between items-center mb-4">
                  {showReplies ? (
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Replies ({replies.length})
                    </h3>
                  ) : (
                    // giữ khoảng trống/biểu tượng nếu muốn layout không dịch chuyển; hoặc render null
                    <div />
                  )}

                  <Button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {showReplyForm ? 'Cancel Reply' : 'Add Reply'}
                  </Button>
                </div>
              )}
              {/* Reply Form */}
              {allowReply && showReplyForm && userToken && (
                <Card className="p-4 mb-4">
                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    <div>
                      <Label htmlFor="reply-content" className="text-sm font-medium mb-2 block">
                        Your Reply
                      </Label>
                      <textarea
                        id="reply-content"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="text-right text-sm text-gray-500 mt-1">
                        {replyContent.length}/500
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent('');
                        }}
                        disabled={isSubmittingReply}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingReply || !replyContent.trim()}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Replies List (can be hidden in Dashboard) */}
              {showReplies && (
                <div className="space-y-4">
                  {replies.length === 0 ? (
                    <Card className="p-6 text-center text-gray-500">
                      {userToken ? 'No replies yet. Be the first to reply!' : 'No replies yet.'}
                    </Card>
                  ) : (
                    replies.map((reply) => (
                      <Card key={reply._id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-600">
                                {reply.user_id?.name || 'Unknown User'}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 ml-11">
                            {reply.content}
                          </p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-red-600">
            Review not found
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetailModal;

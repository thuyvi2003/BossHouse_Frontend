import { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Label } from '../../label';
import { Card } from '../../card';
import { Star, Upload, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '@/config/api';

const EditReviewForm = ({ 
  reviewId, 
  onReviewUpdated, 
  onCancel,
  userToken 
}) => {
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch review data
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        const contentType = response.headers.get('content-type') || '';
        const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };
        
        if (response.ok) {
          setReview(result.data);
          setRating(result.data.rating);
          setTitle(result.data.title || '');
          setContent(result.data.content || '');
          setImages(result.data.images || []);
        } else {
          toast.error(result.message || 'Failed to fetch review');
          onCancel?.();
        }
      } catch (error) {
        console.error('Error fetching review:', error);
        toast.error('An error occurred while fetching the review');
        onCancel?.();
      } finally {
        setIsLoading(false);
      }
    };

    if (reviewId) {
      fetchReview();
    }
  }, [reviewId, userToken, onCancel]);

  const handleRatingClick = (starRating) => {
    setRating(starRating);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images first if any (send base64; backend uploads to Cloudinary)
      const imageUrls = [...(review?.images || [])];
      const newImages = images.filter(img => img.file);
      
      if (newImages.length > 0) {
        for (const img of newImages) {
          const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const b64 = await toBase64(img.file);
          imageUrls.push(b64);
        }
      }

      const updateData = {
        rating,
        title: title.trim(),
        content: content.trim(),
        images: imageUrls
      };

      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(updateData)
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };

      if (response.ok) {
        toast.success('Review updated successfully!');
        onReviewUpdated?.(result.data);
      } else {
        toast.error(result.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('An error occurred while updating the review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading review...</div>
      </Card>
    );
  }

  if (!review) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">Review not found</div>
        <div className="text-center mt-4">
          <Button onClick={onCancel}>Go Back</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h3 className="text-lg font-semibold">Edit Review</h3>
        </div>
        
        {/* Rating Selection */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        
        {/* Content */}
        <div className="mb-4">
          <Label htmlFor="content" className="text-sm font-medium mb-2 block">
            Review
          </Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/500
          </div>
        </div>

        {/* Current Images */}
        {review.images && review.images.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Current Images</Label>
            <div className="grid grid-cols-2 gap-2">
              {review.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Current image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = review.images.filter((_, i) => i !== index);
                      setReview(prev => ({ ...prev, images: newImages }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Add New Images (Optional)</Label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              Select files
            </label>
            
            {/* New Image Previews */}
            {images.filter(img => img.file).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.filter(img => img.file).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !rating || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EditReviewForm;

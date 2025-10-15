import { useState } from 'react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Label } from '../../label';
import { Card } from '../../card';
import { Star, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateReviewForm = ({ 
  productId, 
  productType = 'product', 
  onReviewCreated, 
  onCancel,
  userToken 
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Prepare images as base64 strings (backend will upload to Cloudinary)
      const imageUrls = [];
      if (images.length > 0) {
        for (const img of images) {
          const file = img.file;
          const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const b64 = await toBase64(file);
          imageUrls.push(b64);
        }
      }

      const reviewData = {
        target_type: productType,
        target_id: productId,
        rating,
        title: title.trim(),
        content: content.trim(),
        images: imageUrls
      };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(reviewData)
      });

      // Safely parse JSON only when content-type is JSON
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };

      if (response.ok) {
        toast.success('Review created successfully!');
        onReviewCreated?.(result.data);
        // Reset form
        setRating(0);
        setTitle('');
        setContent('');
        setImages([]);
      } else {
        toast.error(result.message || 'Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      toast.error('An error occurred while creating the review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Add a Review</h3>
          
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

          {/* Image Upload */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Images (Optional)</Label>
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
              
              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {images.map((image, index) => (
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreateReviewForm;

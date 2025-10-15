import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import CreateReviewForm from '@/components/ui/dashboard/reviews/CreateReviewForm';
import ReviewList from '@/components/ui/dashboard/reviews/ReviewList';
import { variationService } from '@/services/productVariationService';
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { addToCart } from '@/services/cartService';
import Toast from '@/components/Layout/Toast';
import { addToWishlist } from '@/services/wishListService';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  // const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showVariations, setShowVariations] = useState(false);
  const [isAddToWishlist, setIsAddToWishlist] = useState(false);
  const [toast, setToast] = useState(null);


  // Fetch product details and variations
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productData = await productService.getById(id);
        if (productData.success) {
          setProduct(productData.data);

          // Set main product image as first image
          if (productData.data.image) {
            setSelectedImage(0);
          }
        }

        // Fetch product variations
        const variationsData = await variationService.getByProduct(id);
        if (variationsData.success) {
          setVariations(variationsData.data || []);
          if (variationsData.data && variationsData.data.length > 0) {
            setSelectedVariation(variationsData.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (selectedVariation?.stock || product?.stock || 99)) {
      setQuantity(newQuantity);
    } else if (newQuantity > currentStock) {
      alert("Not enough stock available!");
    }
  };


  const handleAddToCart = async () => {
    try {
      if (!selectedVariation) {
        setToast({
          type: "warning",
          title: "Notice",
          message: "Please select a product variation first!",
        });
        return;
      }
      const response = await addToCart(selectedVariation._id, quantity);
      if (response === 0) {
        setToast({
          type: "warning",
          title: "Notice",
          message: "You must remove one item before adding a new one.",
        });
        return;
      }
      setToast({
        type: "success",
        title: "Success!",
        message: `Added ${quantity} × ${selectedVariation.name} to cart!`,
      });
      setTimeout(() => navigate("/cart"), 1500);
    } catch (error) {
      setToast({
        type: "error",
        title: "Failed!",
        message: error.response?.data?.message || "Failed to add product to cart.",
      });
    }
  }
  const handleAddToWishlist = async () => {
    try {
      setLoading(true);
      if (!selectedVariation) {
        setToast({
          type: "warning",
          title: "Notice",
          message: "Please select a product variation first!",
        });
        return;
      }
      const res = await addToWishlist(selectedVariation._id);
      if (res.success === false && res.message === "Product already in wishlist") {
        setToast({
          type: "warning",
          title: "Notice",
          message: "Product already exists in your wishlist.",
        });
        return;
      }

      if (res.success) {
        setIsAddToWishlist(true);
        setToast({
          type: "success",
          title: "Success!",
          message: "Product added to wishlist successfully.",
        });
      }
    } catch (error) {
      console.log("error detail:", error);
      setToast({
        type: "error",
        title: "Failed!",
        message: error.response?.data?.message || "Failed to add to wishlist",
      });
    } finally {
      setLoading(false);
    }
  };


  // Handle variation selection
  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
    setQuantity(1); // Reset quantity when changing variation
  };

  // Get current price and stock
  const currentPrice = selectedVariation?.price || product?.price || 0;
  const currentStock = selectedVariation?.stock || product?.stock || 0;
  const currentImage = selectedVariation?.image || product?.image;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#846551]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-[#846551] text-white rounded-lg hover:bg-[#5a4639] transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#846551]">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-500 hover:text-[#846551]">Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {currentImage && (
                <button
                  onClick={() => setSelectedImage(0)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === 0 ? 'border-[#846551]' : 'border-gray-200'
                    }`}
                >
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
              {variations.map((variation, index) => (
                variation.image && (
                  <button
                    key={variation._id}
                    onClick={() => setSelectedImage(index + 1)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index + 1 ? 'border-[#846551]' : 'border-gray-200'
                      }`}
                  >
                    <img
                      src={variation.image}
                      alt={variation.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-[#846551]">
                ${currentPrice.toLocaleString()}
              </span>
              {selectedVariation && (
                <span className="text-lg text-gray-500 line-through">
                  {/* ${product.price.toLocaleString()} */}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {currentStock > 10 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">In Stock ({currentStock})</span>
                </>
              ) : currentStock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-600 font-medium">Only {currentStock} left!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>


            {/* Variations */}
            {variations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
                  <button
                    onClick={() => setShowVariations(!showVariations)}
                    className="flex items-center text-[#846551] hover:text-[#5a4639]"
                  >
                    {showVariations ? (
                      <>
                        Hide <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Show {variations.length} options <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>

                {showVariations && (
                  <div className="grid grid-cols-2 gap-3">
                    {variations.map((variation) => (
                      <button
                        key={variation._id}
                        onClick={() => handleVariationSelect(variation)}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-300 ${selectedVariation?._id === variation._id
                          ? 'border-[#846551] bg-[#f5f3f2]'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          {variation.image && (
                            <img
                              src={variation.image}
                              alt={variation.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{variation.name}</h4>
                            <p className="text-sm text-[#846551] font-semibold">
                              ${variation.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock: {variation.stock}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center transition-transform duration-200"
                    style={{ transform: `scale(${quantity > 1 ? 1.05 : 1})` }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-colors duration-300 ${currentStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#846551] text-white hover:bg-[#5a4639]"
                    }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  disabled={loading || isAddToWishlist}
                  className={`px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center 
    transition-all duration-300 hover:bg-gray-50 relative z-50
    ${isAddToWishlist ? "bg-yellow-50 border-yellow-400" : ""}
  `}
                >
                  <Star
                    className={`w-5 h-5 transition-transform duration-300 
      ${isAddToWishlist ? "fill-yellow-400 text-yellow-500 scale-125" : "text-gray-500"} 
      ${loading ? "animate-pulse" : ""}
    `}
                  />
                </button>

              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-[#846551]" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-[#846551]" />
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-500">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-[#846551]" />
                <div>
                  <p className="font-medium text-gray-900">Quality Guarantee</p>
                  <p className="text-sm text-gray-500">100% satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                    ? 'border-[#846551] text-[#846551]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                <div className="text-gray-600 leading-relaxed">
                  {product.description ? (
                    <>
                      <p className={showFullDescription ? '' : 'line-clamp-3'}>
                        {product.description}
                      </p>
                      {product.description.length > 200 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-2 text-[#846551] hover:text-[#5a4639] font-medium"
                        >
                          {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No description available for this product.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>

                {/* Review Form + List */}
                <ReviewList
                  productId={id}
                  productType="product"
                  userToken={localStorage.getItem('token')}
                  currentUserId={(() => {
                    try {
                      const u = JSON.parse(localStorage.getItem('user'));
                      return u?._id || u?.id || null;
                    } catch {
                      return null;
                    }
                  })()}
                  showCreateForm={true}
                  allowReply={false}
                />
              </div>
            )}

          </div>
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '@/services/api';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Search, 
  Filter,
  Package,
  Truck,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero images
  const heroImages = [
    {
      id: 1,
      image: '/src/assets/Background_Dogs.jpg',
      title: 'Premium Pet Products',
      subtitle: 'Discover our collection of high-quality pet supplies',
      buttonText: 'Shop Now'
    },
    {
      id: 2,
      image: '/src/assets/Background_Cat.png',
      title: 'Happy Pets, Happy Life',
      subtitle: 'Everything your furry friends need for a healthy lifestyle',
      buttonText: 'Explore Products'
    }
  ];

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getAll({ limit: 8 }),
          categoryAPI.getAll({ limit: 10 })
        ]);

        if (productsData.success) {
          setProducts(productsData.data || []);
        }
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.categoryId?._id === selectedCategory ||
                           product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#846551]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="relative w-full h-full">
          {heroImages.map((hero, index) => (
            <div
              key={hero.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${hero.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-center text-white max-w-4xl px-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                      {hero.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      {hero.subtitle}
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center px-8 py-4 bg-[#846551] text-white font-semibold rounded-lg hover:bg-[#5a4639] transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: '0.4s' }}
                    >
                      {hero.buttonText}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#846551] text-white rounded-full mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#846551] text-white rounded-full mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">100% satisfaction guarantee on all products</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#846551] text-white rounded-full mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Products</h3>
              <p className="text-gray-600">Only the best quality pet supplies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-[#f5f3f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Pet Products</h2>
            <p className="text-lg text-gray-600">Search through our extensive collection of premium pet supplies</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent text-lg"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white text-lg"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our most popular pet products</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-300">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#846551]">
                        ${product.price?.toLocaleString() || '0'}
                      </span>
                      <button className="flex items-center px-4 py-2 bg-[#846551] text-white rounded-lg hover:bg-[#5a4639] transition-colors duration-300">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-[#846551] text-white font-semibold rounded-lg hover:bg-[#5a4639] transition-all duration-300"
              >
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#846551]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-white mb-8">Subscribe to our newsletter for the latest pet product updates and exclusive offers</p>
          
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="px-6 py-3 bg-white text-[#846551] font-semibold rounded-r-lg hover:bg-gray-100 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

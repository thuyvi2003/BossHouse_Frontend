import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService} from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import BackgroundDogs from "@/assets/Background_Dogs.jpg";
import BackgroundCat from "@/assets/Background_Cat.png";
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
    ChevronRight,
    Scissors,
    Stethoscope,
    Calendar,
    Users,
    Clock,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm] = useState('');
    const [selectedCategory] = useState('all');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero images
    const heroImages = [
        {
            id: 1,
            image: BackgroundDogs, 
            title: 'Premium Pet Products & Care',
            subtitle: 'Your one-stop shop for quality pet supplies and professional pet care services',
            buttonText: 'Shop Now'
        },
        {
            id: 2,
            image: BackgroundDogs,
            title: 'Happy Pets, Happy Life',
            subtitle: 'From grooming to health checkups - we care for your furry friends',
            buttonText: 'Book Services'
        }
    ];
    // Fetch products and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    productService.getAll({ limit: 8 }),
                    categoryService.getAll({ limit: 10 })
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
    }, [heroImages.length]);

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
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <div className="w-full h-full relative" style={{ backgroundColor: '#846551' }}>
                                {/* Main background image */}
                                <img
                                    src={hero.image}
                                    alt={hero.title}
                                    className="absolute inset-0 w-full h-full object-cover"    
                                />
                                <div className="relative z-10 flex items-center justify-center h-full">
                                    <div className="text-center text-gray-900 max-w-4xl px-4">
                                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                            {hero.title}
                                        </h1>
                                        <p className="text-xl md:text-2xl mb-8">
                                            {hero.subtitle}
                                        </p>
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center px-8 py-4 bg-[#846551] text-white font-semibold rounded-lg hover:bg-[#5a4639] transition-all duration-300 transform hover:scale-105"
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator - sửa className */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
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

            {/* Pet Care Services Section */}
            <section className="py-20 bg-gradient-to-br from-[#f5f3f2] to-[#e8e5e3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Pet Care Services</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Beyond products, we provide comprehensive pet care services to keep your furry friends healthy, happy, and looking their best.
                        </p>
                    </div>

                    <div className="text-center mt-12">
                        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our Pet Care Services?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <Clock className="w-8 h-8 text-[#846551] mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h4>
                                    <p className="text-sm text-gray-600">Book appointments that fit your schedule</p>
                                </div>
                                <div className="text-center">
                                    <Users className="w-8 h-8 text-[#846551] mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-2">Expert Staff</h4>
                                    <p className="text-sm text-gray-600">Certified professionals with years of experience</p>
                                </div>
                                <div className="text-center">
                                    <Shield className="w-8 h-8 text-[#846551] mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-2">Safe & Clean</h4>
                                    <p className="text-sm text-gray-600">Sanitized facilities and safety protocols</p>
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
                                        <Link to={`/product/${product._id}`}>
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover rounded-t-xl cursor-pointer hover:opacity-90 transition-opacity duration-300"
                                                />
                                            )}
                                        </Link>
                                        <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-300">
                                            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                                        </button>
                                    </div>

                                    <div className="p-4 flex flex-col">
                                        <Link
                                            to={`/product/${product._id}`}
                                            className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#846551] transition-colors duration-300"
                                        >
                                            {product.name}
                                        </Link>

                                        <div className="flex-1 mb-3">
                                            <p className="text-gray-600 text-sm line-clamp-3 min-h-[3.75rem]">
                                                {product.description || 'No description available'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xl font-bold text-[#846551]">
                                                ${product.price?.toLocaleString() || '0'}
                                            </span>
                                            <button className="flex items-center px-3 py-1.5 bg-[#846551] text-white rounded-md hover:bg-[#5a4639] transition-colors duration-300 text-sm">
                                                <ShoppingCart className="w-4 h-4 mr-1" />
                                                Add
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
        </div>
    );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import Background_product from '@/assets/Background_product.png'
import ChatAIWidget from '@/components/ChatAIWidget';

import AOS from "aos";
import "aos/dist/aos.css";

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

    // Hero slides rendered as looping background videos
    const heroSlides = [
        {
            id: 1,
            videoSrc: "https://youtu.be/bxAWHMhXyzc",
            poster: "https://images.pexels.com/photos/7210740/pexels-photo-7210740.jpeg",
            title: "Premium Pet Products & Care",
            subtitle:
                "Your one-stop shop for quality pet supplies and professional pet care services",
            buttonText: "Shop Now",
            buttonLink: "/products",
        },
        {
            id: 2,
            videoSrc: "https://www.vecteezy.com/video/54311819-woman-snuggling-with-a-fluffy-samoyed-puppy-dog-in-the-warm-glow-of-sunset-exuding-love-happiness-and-gentle-affection-copy-space-for-your-text",
            poster: "https://images.pexels.com/photos/4852949/pexels-photo-4852949.jpeg",
            title: "Happy Pets, Happy Life",
            subtitle:
                "From grooming to health checkups - we care for your furry friends",
            buttonText: "Book Services",
            buttonLink: "/services",
        },
        {
            id: 3,
            videoSrc: "https://cdn.coverr.co/videos/coverr-cat-in-a-pet-store-3009/1080p.mp4",
            poster: "https://images.pexels.com/photos/5732466/pexels-photo-5732466.jpeg",
            title: "Treats, Toys & Tail Wags",
            subtitle:
                "Explore curated delights to keep every pet healthy, happy, and engaged",
            buttonText: "Discover Deals",
            buttonLink: "/products",
        },
    ];


    // Init AOS
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
        });
    }, []);

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

    // Auto-rotate hero slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

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
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
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
            <section className="relative h-[100vh] overflow-hidden" data-aos="fade">
                <div className="relative w-full h-full">
                    {heroSlides.map((hero, index) => (
                        <div
                            key={hero.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <div className="w-full h-full relative" style={{ backgroundColor: '#846551' }}>
                                <video
                                    src={hero.videoSrc}
                                    poster={hero.poster}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
                                <div className="relative z-10 flex items-center justify-center h-full px-4">
                                    <div className="text-center text-white max-w-4xl px-4" data-aos="zoom-in">
                                        <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">{hero.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 text-white/90 drop-shadow">{hero.subtitle}</p>
                                        <Link
                                            to={hero.buttonLink || '/products'}
                                            className="inline-flex items-center px-8 py-4 bg-[#f4a261] text-white font-semibold rounded-lg hover:bg-[#e76f51] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-black/20"
                                            data-aos="fade-up"
                                            data-aos-delay="200"
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
            </section>



            {/* PETS */}
            <section className="py-20 bg-[#fdf7f1]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
                        data-aos="fade-up"
                    >
                        Beer Traiple for Dres
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {/* Item 1 */}
                        <div
                            className="flex flex-col items-center text-center"
                            data-aos="zoom-in"
                            data-aos-delay="0"
                        >
                            <img
                                src="src/assets/Pets/Shiba_Inu.png"
                                alt="dog"
                                className="w-40 h-40 rounded-full object-cover mb-6 shadow-md 
                     transition-transform duration-500 hover:scale-110 hover:shadow-xl cursor-pointer"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dog</h3>
                        </div>

                        {/* Item 2 */}
                        <div
                            className="flex flex-col items-center text-center"
                            data-aos="zoom-in"
                            data-aos-delay="100"
                        >
                            <img
                                src="src/assets/Pets/Cafe_Cat.png"
                                alt="cat"
                                className="w-40 h-40 rounded-full object-cover mb-6 shadow-md 
                     transition-transform duration-500 hover:scale-110 hover:shadow-xl cursor-pointer"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cat</h3>
                        </div>

                        {/* Item 3 */}
                        <div
                            className="flex flex-col items-center text-center"
                            data-aos="zoom-in"
                            data-aos-delay="200"
                        >
                            <img
                                src="src/assets/Pets/Rabbit.png"
                                alt="rabbit"
                                className="w-40 h-40 rounded-full object-cover mb-6 shadow-md 
                     transition-transform duration-500 hover:scale-110 hover:shadow-xl cursor-pointer"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rabbit</h3>
                        </div>

                        {/* Item 4 */}
                        <div
                            className="flex flex-col items-center text-center"
                            data-aos="zoom-in"
                            data-aos-delay="300"
                        >
                            <img
                                src="src/assets/Pets/Brid.png"
                                alt="bird"
                                className="w-40 h-40 rounded-full object-cover mb-6 shadow-md 
                     transition-transform duration-500 hover:scale-110 hover:shadow-xl cursor-pointer"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bird</h3>
                        </div>
                    </div>
                </div>
            </section>


            {/* Information */}
            <div className="py-20">
                {/* Component 1 */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-10 py-30">
                        {/* Item 1 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-0">
                                <img
                                    src="https://images.pexels.com/photos/7725617/pexels-photo-7725617.jpeg"
                                    alt="Pet dining area"
                                    className="w-full h-100 object-cover"
                                />
                            </div>

                            <div className="p-6 translate-y-0">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Cat Tree
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    A cat tree offers your feline friends a safe place to climb, scratch, and rest.
                                    It helps protect furniture while providing exercise and mental stimulation.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-8">
                                <img
                                    src="https://images.pexels.com/photos/27598347/pexels-photo-27598347.jpeg"
                                    alt="Pet scratching post"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            <div className="p-6 translate-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Pet Bed
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    A cozy pet bed gives your companion a private space to rest and sleep.
                                    Soft, supportive cushions ensure comfort and security for healthy relaxation.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-16">
                                <img
                                    src="https://images.pexels.com/photos/5731790/pexels-photo-5731790.jpeg"
                                    alt="Cat walk shelf"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            <div className="p-6 translate-y-16">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Pet Outfit
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Pet outfits bring style and fun while keeping pets warm in cooler seasons.
                                    Designed for comfort and cuteness, they make your furry friends stand out.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component 2 */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-10 py-30">
                        {/* Item 1 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-0">
                                <img
                                    src="https://images.pexels.com/photos/8121148/pexels-photo-8121148.jpeg"
                                    alt="Pet cozy bed"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            <div className="p-6 translate-y-0">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Pet Food & Treats
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Nutritious food and tasty treats provide energy, health, and happiness.
                                    Balanced meals and rewards support your pet’s overall well-being every day.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-8">
                                <img
                                    src="https://images.pexels.com/photos/6957569/pexels-photo-6957569.jpeg"
                                    alt="Rabbit playground"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            <div className="p-6 translate-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Rabbit Playground
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Rabbits need safe spaces to hop, chew, and play.
                                    A small playground with tunnels or chew toys keeps them
                                    active and mentally stimulated.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div>
                            <div className="rounded-lg shadow-lg overflow-hidden transform translate-y-16">
                                <img
                                    src="https://images.pexels.com/photos/7153088/pexels-photo-7153088.jpeg"
                                    alt="Bird perch"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            <div className="p-6 translate-y-16">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Cat Teaser Wand
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    A teaser wand toy encourages playful interaction between pets and owners.
                                    It helps cats release energy, stay active, and strengthen your bond together.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Services Section */}
            <section className="gap-8 p-8 rounded-lg bg-[#eeeae3]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start py-30 gap-16">
                    <div className="flex-1" data-aos="fade-right">
                        <h2 className="text-[32px] font-bold mb-4">Grooming</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our grooming service is designed to keep your pets not only clean and comfortable but also healthy and happy.
                            From regular bathing and brushing to specialized coat care for different breeds, our professional groomers
                            use gentle techniques and high-quality products that are safe for pets with sensitive skin.
                            We also provide nail trimming, ear cleaning, and other hygiene treatments to prevent discomfort and
                            health problems. Grooming is not only about appearance – it helps maintain your pet’s overall well-being
                            while making them feel relaxed and loved.

                        </p>
                    </div>
                    <div className="relative group overflow-hidden rounded-xl shadow-md max-w-2xl w-full" data-aos="fade-left">
                        <img
                            src="src/assets/services/grooming1.jpg"
                            alt="cat door"
                            className="w-full object-cover transform transition duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-90"
                        />
                    </div>
                </div>
                {/* Boarding */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start py-30 gap-16">
                    <div className="relative group overflow-hidden rounded-xl shadow-md max-w-2xl w-full" data-aos="fade-right">
                        <img
                            src="src/assets/services/boarding.jpg"
                            alt="boarding"
                            className="w-full object-cover transform transition duration-500 group-hover:scale-110 group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <span className="absolute bottom-4 left-4 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                            View More →
                        </span>
                    </div>
                    <div className="flex-1" data-aos="fade-left">
                        <h2 className="text-[32px] font-bold mb-4">Boarding</h2>
                        <p className="text-gray-700 leading-relaxed">
                            When you’re away, we provide a safe and caring home for your pets through our boarding service.
                            Our facilities are designed to give cats and dogs a comfortable space where they can rest, play, and
                            interact under supervision. We ensure daily feeding schedules, clean bedding, and regular exercise
                            to make sure your pet feels at home. Our staff members are trained to monitor their health and
                            behavior closely, providing you peace of mind knowing that your beloved companion is in good hands.

                        </p>
                    </div>
                </div>
                {/* Health check */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start py-30 gap-16">
                    <div className="flex-1" data-aos="fade-right">
                        <h2 className="text-[32px] font-bold mb-4">Health Check</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Routine health checks are essential to ensure your pets live long and healthy lives.
                            Our veterinary team provides comprehensive health examinations including weight monitoring,
                            dental checks, vaccinations, and preventive care tailored to your pet’s age and needs.
                            Early detection of potential health issues allows us to provide timely treatment and guidance,
                            keeping your pets active and happy. Whether it’s a yearly check-up or a special concern,
                            our health check service is dedicated to supporting your pet’s well-being.

                        </p>
                    </div>
                    <div className="relative group overflow-hidden rounded-xl shadow-md max-w-2xl w-full" data-aos="fade-left">
                        <img
                            src="src/assets/services/health-check.jpg"
                            alt="cat door"
                            className="w-full object-cover transform transition duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-90"
                        />
                    </div>
                </div>

                {/* Vaccination */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start py-30 gap-16">
                    <div className="relative group overflow-hidden rounded-xl shadow-md max-w-2xl w-full" data-aos="fade-right">
                        <img
                            src="src/assets/services/vaccination.jpg"
                            alt="boarding"
                            className="w-full object-cover transform transition duration-500 group-hover:scale-110 group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <span className="absolute bottom-4 left-4 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                            View More →
                        </span>
                    </div>
                    <div className="flex-1" data-aos="fade-left">
                        <h2 className="text-[32px] font-bold mb-4">Vaccination</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Vaccinations are one of the most important steps in protecting your pets from preventable diseases.
                            Our vaccination service provides a comprehensive schedule tailored to your pet’s age, breed, and health condition.
                            From core vaccines to optional boosters, we ensure your furry companions receive the right protection at the right time.
                            Regular vaccinations not only safeguard your pet’s health but also help prevent the spread of contagious diseases within the community.
                            With careful monitoring and professional care, we make the process safe, stress-free, and effective for every pet.
                            .
                        </p>
                    </div>
                </div>
                {/* Adoption */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start py-30 gap-16">
                    <div className="flex-1" data-aos="fade-right">
                        <h2 className="text-[32px] font-bold mb-4">Adoption Consultation</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Thinking of adding a new furry member to your family? Our adoption consultation service is here to help.
                            We provide personalized advice on choosing the right pet that matches your lifestyle, living space,
                            and family dynamics. Our team guides you through the adoption process, ensuring that both you and the pet
                            experience a smooth and happy transition. From breed information to first-time pet parent tips,
                            we aim to build strong, lasting bonds between families and their adopted companions.

                        </p>
                    </div>
                    <div className="relative group overflow-hidden rounded-xl shadow-md max-w-2xl w-full" data-aos="fade-left">
                        <img
                            src="src/assets/services/adoption-consultation.jpg"
                            alt="cat door"
                            className="w-full object-cover transform transition duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-90"
                        />
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-16" style={{ backgroundImage: `url(${Background_product})` }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                        <p className="text-lg text-gray-600">Discover our most popular pet products</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.slice(0, 4).map((product, index) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                data-aos="zoom-in"
                                data-aos-delay={index * 100}
                            >
                                {/* Image with Heart Button */}
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
                                    {/* Heart Icon top-right */}
                                    <button className="absolute top-3 right-3 p-2 bg-opacity-80 hover:bg-opacity-100  transition-all duration-300 ">
                                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                                    </button>
                                </div>

                                {/* Product Info */}
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
                                    {/* Only price now */}
                                    <span className="text-xl font-bold text-[#846551]">
                                        ${product.price?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="fixed bottom-4 right-4 z-50">
                <ChatAIWidget />
            </div>
        </div>
    );
};

export default HomePage;

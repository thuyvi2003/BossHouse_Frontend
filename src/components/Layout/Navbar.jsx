import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Bell, Gift } from "phosphor-react";
import { getUserCart } from "@/services/cartService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import notificationService from "@/services/notificationService";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { claimPromotion, getAvailablePromotions } from "@/services/promotionService";



export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const { user, logout } = useAuthStore();
    const [promotions, setPromotions] = useState([]);
    const [showPromoTooltip, setShowPromoTooltip] = useState(false);
    const [hasNotificationFeature, setHasNotificationFeature] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
    const navigate = useNavigate();



    /**
     * 🚨 CẢNH BÁO:
     * Mã nguồn này thuộc về Vo Lam Thuy Vi.
     * Vui lòng KHÔNG tự ý chỉnh sửa hoặc xóa bất kỳ đoạn code nào bên dưới nếu chưa có sự cho phép.
     * Mọi thay đổi không được phê duyệt có thể gây lỗi hệ thống hoặc mất dữ liệu.
     */
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await getUserCart();
                setCartItems(res.data?.items || []);
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchCart();
    }, []);
    // -----------------------------------------------------------------------------------------------------------------------------------------------



    const enableNotificationFeature = () => {
        setHasNotificationFeature(true);
    };

    const addNotification = (notification) => {
        if (hasNotificationFeature) {
            setNotifications((prev) => [notification, ...prev]);
        }
    };

    useEffect(() => {
        const fetchNotif = async () => {
            try {
                const res = await notificationService.getAllNotifications({ limit: 5 });
                const list = (res?.data?.notifications) ?? (res?.data) ?? (res?.notifications) ?? res ?? [];
                setNotifications(Array.isArray(list) ? list : []);
            } catch (e) {
                setNotifications([]);
            }
        };
        if (showNotificationTooltip) {
            setHasNotificationFeature(true);
            fetchNotif();
        }
    }, [showNotificationTooltip]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };



    /**
     * 🚨 CẢNH BÁO:
     * Mã nguồn này thuộc về Vo Lam Thuy Vi.
     * Vui lòng KHÔNG tự ý chỉnh sửa hoặc xóa bất kỳ đoạn code nào bên dưới nếu chưa có sự cho phép.
     * Mọi thay đổi không được phê duyệt có thể gây lỗi hệ thống hoặc mất dữ liệu.
     */
    const fetchPromotions = async () => {
        try {
            const res = await getAvailablePromotions();
            setPromotions(res.data?.data || []);
            console.log("Promotion day ne", res.data?.data)
        } catch (error) {
            console.error("Failed to fetch promotions:", error.message);
        }
    };
    useEffect(() => {
        fetchPromotions();
    }, []);


    const handleClaimPromotion = async (promotionId) => {
        try {
            await claimPromotion(promotionId);
            toast.success("Promotion claimed successfully");
            setShowPromoTooltip(false);

            // Cập nhật lại danh sách (nếu muốn)
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to claim promotion");
            setShowPromoTooltip(false);
        }
    };                                                                                                                                         
    // ---------------------------------------------------------------------------------------------------------------------------------------



    const displayedItems = cartItems.slice(0, 3);

    const navLinkClass = ({ isActive }) =>
        `relative transition-all duration-200 hover:scale-110 
        hover:text-black after:content-[''] after:absolute after:w-0 after:h-[2px] 
        after:bg-black after:left-0 after:-bottom-1 after:transition-all 
        after:duration-300 ${isActive ? "text-black after:w-full" : "text-gray-600"}`;

    return (
        <nav className="w-full bg-white/90 backdrop-blur-md shadow-md border-b px-10 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-3">
                <img
                    src="\src\assets\Logo_BossHouse.png"
                    alt="BossHouse Logo"
                    className="w-12 h-12 object-contain drop-shadow-md"
                />
                <span className="text-2xl font-bold tracking-wide text-gray-800">BossHouse</span>
            </Link>

            <div className="flex gap-8 text-lg font-medium items-center">
                <NavLink to="/" className={navLinkClass}>
                    Home
                </NavLink>
                <NavLink to="/products" className={navLinkClass}>
                    Products
                </NavLink>
                <NavLink to="/services" className={navLinkClass}>
                    Services
                </NavLink>
                <NavLink to="/post" className={navLinkClass}>
                    Blog
                </NavLink>
                <NavLink to="/contact" className={navLinkClass}>
                    Contact
                </NavLink>

                {/* Notification Dropdown */}
                {user && <NotificationDropdown />}

                {/* Promotion  */}
                <div
                    className="relative"
                    onMouseEnter={() => setShowPromoTooltip(true)}
                    onMouseLeave={() => setShowPromoTooltip(false)}
                >
                    <Gift size={28} className="text-black hover:text-gray-600 transition cursor-pointer" />
                    {promotions.length > 0 && (
                        <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                            {promotions.length}
                        </span>
                    )}
                    {showPromoTooltip && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border before:absolute before:w-[40%] before:h-[40px]  before:-top-4 before:right-0 border-gray-200 z-50 animate-fade-in">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">Available Promotions</h3>
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {promotions.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {promotions.map((promo) => (
                                            <li
                                                key={promo._id}
                                                className="p-3 hover:bg-gray-50 transition flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {promo.description || promo.code}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {promo.promotion_type === "percent"
                                                            ? `Giảm ${promo.promotion_value}%`
                                                            : `Giảm ${promo.promotion_value.toLocaleString()}đ`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleClaimPromotion(promo._id)}
                                                    className="text-xs px-3 py-1 rounded bg-[#846551] text-white hover:bg-[#6d5041] transition"
                                                >
                                                    Claim
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No promotions available
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Cart Icon */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <NavLink to="/cart" className={`${navLinkClass} flex items-center gap-2`}>
                        <div className="relative">
                            <ShoppingCart size={28} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                                    {cartItems.length}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <div
                        className={`absolute right-0 mt-2 w-72 bg-white border  rounded-xl shadow-xl transition-all duration-300 origin-top transform ${isOpen
                            ? "scale-100 opacity-100 translate-y-0"
                            : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
                            }`}
                    >
                        <div className="p-4">
                            {cartItems.length > 0 ? (
                                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                    {displayedItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                                        >
                                            <img
                                                src={item.variation_id?.image}
                                                alt={item.variation_id?.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {item.variation_id?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Quantity: {item?.quantity}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    Your cart is empty.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conditional Login/User Avatar Dropdown */}
                {user ? (
                    <div className="ml-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.profile_image} alt={user.name} />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <NavLink to="/profile" className="w-full">
                                        <User className="mr-2" />
                                        Profile
                                    </NavLink>
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={handleLogout} >
                                    <LogOut className="mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <NavLink
                        to="/login"
                        className="ml-4 px-5 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 shadow-md"
                    >
                        Login
                    </NavLink>
                )}
            </div>
        </nav>
    );
}
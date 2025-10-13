import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Bell } from "phosphor-react";
import { getUserCart } from "@/services/cartService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
    const [hasNotificationFeature, setHasNotificationFeature] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

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

    const enableNotificationFeature = () => {
        setHasNotificationFeature(true);
    };

    const addNotification = (notification) => {
        if (hasNotificationFeature) {
            setNotifications((prev) => [notification, ...prev]);
        }
    };

    useEffect(() => {
        setHasNotificationFeature(false);
        if (hasNotificationFeature) {
            // Future: Fetch notifications from API
            // fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [hasNotificationFeature]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

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

                {/* Notification Icon */}
                <div
                    className="relative"
                    onMouseEnter={() => setShowNotificationTooltip(true)}
                    onMouseLeave={() => setShowNotificationTooltip(false)}
                >
                    <div className="relative">
                        <Bell size={28} className="text-back hover:text-gray-600 transition-colors duration-200 cursor-pointer" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                                {notifications.length}
                            </span>
                        )}
                    </div>

                    {/* Notification Tooltip */}
                    {showNotificationTooltip && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {hasNotificationFeature ? (
                                    notifications.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {notifications.map((notification) => (
                                                <li key={notification.id} className="p-3 hover:bg-gray-50">
                                                    <p className="text-sm text-gray-900">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">
                                            No notifications
                                        </p>
                                    )
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        Notifications is empty
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
                        className={`absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl transition-all duration-300 origin-top transform ${isOpen
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

                {/* Conditional Login/Logout Button */}
                {user ? (
                    <Button
                        className="ml-4 px-5 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 shadow-md"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
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
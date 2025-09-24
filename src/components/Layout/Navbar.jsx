// Vo Lam Thuy Vi
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    //Database mau
    const cartItems = [
        {
            id: 1,
            name: "Dog Shampoo",
            price: 120000,
            image: "/src/assets/dog-shampoo.png",
            qty: 1,
        },
        {
            id: 2,
            name: "Cat Toy",
            price: 80000,
            image: "/src/assets/cat-toy.png",
            qty: 2,
        },
    ];



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
                <NavLink to="/home" className={navLinkClass}>
                    Home
                </NavLink>
                <NavLink to="/collection" className={navLinkClass}>
                    Collection
                </NavLink>
                <NavLink to="/post" className={navLinkClass}>
                    Blogs
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                    About
                </NavLink>


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
                                    {cartItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Qty: {item.qty}</p>
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


                <NavLink
                    to="/login"
                    className="ml-4 px-5 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 shadow-md"
                >
                    Login
                </NavLink>
            </div>
        </nav>
    );
}

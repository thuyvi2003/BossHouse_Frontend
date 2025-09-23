// Vo Lam Thuy Vi
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";

export default function Navbar() {
    const navLinkClass =
        "relative transition-all duration-200 hover:scale-110 hover:text-black";

    return (
        <nav className="w-full bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-2">
                <img
                    src="\src\assets\Logo_BossHouse.png"
                    alt="BossHouse Logo"
                    className="w-14 h-14 object-contain"
                />
                <span className="text-2xl font-bold tracking-wide">BossHouse</span>
            </Link>

            {/* Menu */}
            <div className="flex gap-8 text-gray-700 font-medium items-center">
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
                <NavLink to="/cart" className={`${navLinkClass} flex items-center gap-1`}>
                    <ShoppingCart size={22} weight="bold" />

                </NavLink>
                <NavLink to="/login" className={navLinkClass}>
                    Login
                </NavLink>
            </div>
        </nav>
    );
}

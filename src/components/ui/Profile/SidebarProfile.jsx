import { NavLink } from "react-router-dom";
import { House, SquaresFour, Clock, ListChecks, Star } from "phosphor-react";
import { CalendarCheck } from "phosphor-react";

export default function SidebarProfile() {
    return (
        <div className="w-64 bg-white border-r border-[#d7cbbf] flex flex-col h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-[#d7cbbf] flex items-center gap-2">
                <div className="w-8 h-8 bg-[#846551] rounded-lg"></div>
                <span className="font-semibold text-gray-800">Profile UI</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {/* Main Pages */}
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <House size={20} weight="duotone" />
                    <span className="text-sm">Home</span>
                </NavLink>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <SquaresFour size={20} weight="duotone" />
                    <span className="text-sm">Dashboard</span>
                </NavLink>

                <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <ListChecks size={20} weight="duotone" />
                    <span className="text-sm">Order History</span>
                </NavLink>

                <NavLink
                    to="/schedule"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <Clock size={20} weight="duotone" />
                    <span className="text-sm">Schedule</span>
                </NavLink>

                {/* Profile Pages */}
                <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <SquaresFour size={20} weight="duotone" />
                    <span className="text-sm">Profile</span>
                </NavLink>

                <NavLink
                    to="/profile/contact-history"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`
                    }
                >
                    <ListChecks size={20} weight="duotone" />
                    <span className="text-sm">Contact History</span>
                </NavLink>

                <NavLink
                    to="/profile/booking-history"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""
                        }`
                    }
                >
                    <CalendarCheck size={20} weight="duotone" />
                    <span className="text-sm">Booking History</span>
                </NavLink>
                <NavLink
                    to="/profile/wishlist"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""
                        }`
                    }
                >
                    <Star size={20} weight="duotone" />
                    <span className="text-sm">Wishlist</span>
                </NavLink>
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-[#d7cbbf] space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg cursor-pointer">
                    <span className="text-sm">Support</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg cursor-pointer">
                    <span className="text-sm">Settings</span>
                </div>
            </div>

            {/* User Profile */}
            {/* <div className="p-4 border-t border-[#d7cbbf] flex items-center gap-3">
                <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">Olivia Rhye</div>
                    <div className="text-xs text-gray-500">olivia@bosshouse.com</div>
                </div>
            </div> */}
        </div>
    );
}

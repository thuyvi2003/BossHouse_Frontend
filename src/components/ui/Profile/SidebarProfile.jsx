import { NavLink } from "react-router-dom";
import {
  House,
  SquaresFour,
  Clock,
  ListChecks,
  Star,
  CalendarCheck,
  Receipt,
  PawPrint,
} from "phosphor-react";
import { useEffect, useState } from "react";

export default function SidebarProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  const isVet = user?.role?.toLowerCase().trim() === "veterinarian";

  if (!user) {
    return (
      <div className="w-64 bg-white border-r border-[#d7cbbf] flex items-center justify-center h-screen">
        <span className="text-gray-500 text-sm">Loading user...</span>
      </div>
    );
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#f9f5f1] ${isActive ? "bg-[#f9f5f1]" : ""}`;

  return (
    <div className="w-64 bg-white border-r border-[#d7cbbf] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#d7cbbf] flex items-center gap-2">
        <div className="w-8 h-8 bg-[#846551] rounded-lg"></div>
        <span className="font-semibold text-gray-800">Profile UI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <NavLink to="/" className={linkClass}>
          <House size={20} weight="duotone" />
          <span className="text-sm">Home</span>
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          <SquaresFour size={20} weight="duotone" />
          <span className="text-sm">Dashboard</span>
        </NavLink>

        {/* Schedule — chỉ hiện nếu là vet */}
        {isVet && (
          <NavLink to="/profile/schedule" className={linkClass}>
            <Clock size={20} weight="duotone" />
            <span className="text-sm">Schedule</span>
          </NavLink>
        )}

        {/* Profile Pages */}
        <NavLink to="/profile" end className={linkClass}>
          <SquaresFour size={20} weight="duotone" />
          <span className="text-sm">Profile</span>
        </NavLink>

        <NavLink to="/profile/pets" className={linkClass}>
          <PawPrint size={20} weight="duotone" />
          <span className="text-sm">Pet Profiles</span>
        </NavLink>

        <NavLink to="/profile/contact-history" className={linkClass}>
          <ListChecks size={20} weight="duotone" />
          <span className="text-sm">Contact History</span>
        </NavLink>

        <NavLink to="/profile/booking-history" className={linkClass}>
          <CalendarCheck size={20} weight="duotone" />
          <span className="text-sm">Booking History</span>
        </NavLink>

        <NavLink to="/profile/wishlist" className={linkClass}>
          <Star size={20} weight="duotone" />
          <span className="text-sm">Wishlist</span>
        </NavLink>

        <NavLink to="/profile/orders/my" className={linkClass}>
          <Receipt size={20} weight="duotone" />
          <span className="text-sm">Order History</span>
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
      <div className="p-4 border-t border-[#d7cbbf] flex items-center gap-3">
        <img
          src={user.profile_image || "https://placehold.co/100x100"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
    </div>
  );
}

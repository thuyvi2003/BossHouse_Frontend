// Vo Lam Thuy Vi
import { useState } from "react";
import CategoryManagement from "../components/ui/Dashboard/Categories/CategoryManagement";
import ProductManagement from "../components/ui/Dashboard/Products/ProductManagement";
import ProductVariationManagement from "../components/ui/Dashboard/ProductVariations/ProductVariationManagement";
import PromotionManagement from "../components/ui/Dashboard/Promotions/PromotionManagement";
import BookingManager from "@/components/ui/Dashboard/Bookings/BookingManager";
import ContactManager from "../components/ui/Dashboard/Contact/ContactManager";

import {
  ChartBar,
  User,
  Package,
  FilmSlate,
  CalendarCheck,
  Note,
  Star,
  Bell,
  Gear,
  SignOut,
  Crown,
} from "phosphor-react";

import Logo from "@/assets/Logo_BossHouse.png";
import Background from "@/assets/Background_Cat.png";
import PostManagement from "@/components/ui/Dashboard/Posts/PostManagement";
import ReviewManagement from "@/components/ui/Dashboard/Reviews/ReviewManagement";
import NotificationManagement from "@/components/ui/Dashboard/Notifications/NotificationManagement";
import AccountManagement from "@/components/ui/Dashboard/AccountManagement/AccountManagement";
import StockManagement from "@/components/ui/Dashboard/Stocks/StockManagement";
import { Clock } from "lucide-react";
import ScheduleManager from "@/components/ui/Dashboard/Schedule/ScheduleManager";
import OrderManagement from "@/components/ui/Dashboard/Orders/OrderManagement";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { id: "overview", icon: <ChartBar size={22} />, label: "Overview" },
    { id: "account", icon: <User size={22} />, label: "Account" },
    { id: "product", icon: <Package size={22} />, label: "Product" },
    { id: "category", icon: <Package size={22} />, label: "Category" },
    { id: "variation", icon: <Package size={22} />, label: "Product Variation" },
    { id: "stock", icon: <Package size={22} />, label: "Stock Management" },
    { id: "promotion", icon: <FilmSlate size={22} />, label: "Promotion" },
    { id: "booking", icon: <CalendarCheck size={22} />, label: "Booking" },
    { id: "post", icon: <Note size={22} />, label: "Post" },
    { id: "contact", icon: <User size={22} />, label: "Contact" },
    { id: "review", icon: <Star size={22} />, label: "Review" },
    { id: "notification", icon: <Bell size={22} />, label: "Notification" },
    { id: "schedule", icon: <Clock size={22} />, label: "Schedule" },
    { id: "order", icon: <Package size={22} />, label: "Order" },

  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <h2 className="text-2xl font-bold">📊 Overview</h2>;
      case "account":
        return <AccountManagement />;
      case "product":
        return <ProductManagement />;
      case "category":
        return <CategoryManagement />;
      case "variation":
        return <ProductVariationManagement />;
      case "stock":
        return <StockManagement />;
      case "promotion":
        return <PromotionManagement />;
      case "booking":
        return <BookingManager />;
      case "post":
        return <PostManagement />;
      case "contact":
        return <ContactManager />;
      case "review":
        const token = localStorage.getItem("token");
        console.log("Dashboard token:", token);
        return <ReviewManagement userToken={token} isAdmin={true} />;
      case "notification":
        return <NotificationManagement />;
      case "schedule":
        return <ScheduleManager />;
      case "order":
        return <OrderManagement />;
      default:
        return <h2 className="text-2xl font-bold">Welcome to Dashboard</h2>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#222421] text-white flex flex-col overflow-y-auto h-screen">
        <div className="p-6 flex flex-col items-center gap-2">
          <img
            src={Logo}
            alt="Boss House Logo"
            className="w-18 h-18 object-contain rounded-b-4xl"
          />
          <h1 className="text-3xl font-extrabold tracking-wide">Boss House</h1>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                    ? "bg-[#846551] text-white"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#2a2a2a]">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors">
            <Gear size={20} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors">
            <SignOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main + Footer */}
      <div className="flex flex-col flex-1">
        <main
          className="flex-1 shadow-xl animate-fade-in bg-cover bg-center p-6 pb-4 overflow-hidden"
          style={{ backgroundImage: `url(${Background})` }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

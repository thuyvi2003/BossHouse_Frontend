import { useState } from "react";
import CategoryManagement from "../components/ui/Dashboard/Categories/CategoryManagement";
import ProductManagement from "../components/ui/Dashboard/Products/ProductManagement";
import ProductVariationManagement from "../components/ui/Dashboard/ProductVariations/ProductVariationManagement";
import PromotionManagement from "../components/ui/Dashboard/Promotions/PromotionManagement";
import BookingManager from "@/components/ui/Dashboard/Bookings/BookingManager";
import ContactManager from "../components/ui/Dashboard/Contact/ContactManager";
import ScheduleManager from "@/components/ui/Dashboard/Schedule/ScheduleManager";
import PostManagement from "@/components/ui/Dashboard/Posts/PostManagement";
import ReviewManagement from "@/components/ui/Dashboard/Reviews/ReviewManagement";
import NotificationManagement from "@/components/ui/Dashboard/Notifications/NotificationManagement";
import AccountManagement from "@/components/ui/Dashboard/AccountManagement/AccountManagement";
import StockManagement from "@/components/ui/Dashboard/Stocks/StockManagement";
import OrderManagement from "@/components/ui/Dashboard/Orders/OrderManagement";

import {
  ChartBar,
  User,
  Package,
  FilmSlate,
  CalendarCheck,
  Clock,
  Note,
  Star,
  Bell,
  Gear,
  SignOut,
  CaretDown,
  CaretUp,
} from "phosphor-react";

import Logo from "@/assets/Logo_BossHouse.png";
import Background from "@/assets/Background_Cat.png";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const sidebarGroups = [
    {
      id: "overview",
      label: "Overview",
      icon: <ChartBar size={22} />,
      type: "single",
    },
    {
      id: "userGroup",
      label: "User",
      icon: <User size={22} />,
      items: [
        { id: "account", label: "Account", icon: <User size={20} /> },
        { id: "contact", label: "Contact", icon: <User size={20} /> },
        { id: "review", label: "Review", icon: <Star size={20} /> },
      ],
    },
    {
      id: "productGroup",
      label: "Product",
      icon: <Package size={22} />,
      items: [
        { id: "product", label: "Product", icon: <Package size={20} /> },
        { id: "category", label: "Category", icon: <Package size={20} /> },
        {
          id: "variation",
          label: "Product Variation",
          icon: <Package size={20} />,
        },
        {
          id: "stock",
          label: "Stock Management",
          icon: <Package size={20} />,
        },
      ],
    },
    {
      id: "promotionGroup",
      label: "Purchase",
      icon: <FilmSlate size={22} />,
      items: [
        { id: "promotion", label: "Promotion", icon: <FilmSlate size={20} /> },
        { id: "order", label: "Order", icon: <Package size={20} /> },
      ],
    },
    {
      id: "contentGroup",
      label: "Content",
      icon: <Note size={22} />,
      items: [
        { id: "post", label: "Post", icon: <Note size={20} /> },
        { id: "booking", label: "Booking", icon: <CalendarCheck size={20} /> },
        { id: "schedule", label: "Schedule", icon: <Clock size={20} /> },
      ],
    },
    {
      id: "systemGroup",
      label: "System",
      icon: <Bell size={22} />,
      items: [
        { id: "notification", label: "Notification", icon: <Bell size={20} /> },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <h2 className="text-2xl font-bold">Overview</h2>;
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
    <div className="relative flex min-h-screen  text-[#1a1a16]">
      <span className="pointer-events-none absolute -top-24 -left-28 h-72 w-72 rounded-full bg-[#d8ccbf]/70 blur-3xl opacity-80 animate-pulse" />
      <span className="pointer-events-none absolute bottom-24 -right-24 h-80 w-80 rounded-full bg-[#8b5a3c]/60 blur-3xl opacity-80 animate-pulse" />
      <span className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#f5f3f0]/80 blur-3xl opacity-75 animate-pulse" />

      <aside className="relative z-10 flex  w-72 flex-col overflow-y-auto border-r bg-[#d8ccbf]/85 p-6 text-[#1a1a16] shadow-2xl shadow-[#1a1a16]/15 backdrop-blur-2xl">
        <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl border border-[#d8ccbf] bg-[#f5f3f0]/90 p-6 text-center shadow-lg shadow-[#1a1a16]/10">
          <img
            src={Logo}
            alt="Boss House Logo"
            className="h-20 w-20 rounded-3xl object-contain shadow-lg shadow-[#1a1a16]/10"
          />
          <h1 className="text-3xl font-extrabold tracking-[0.4em] text-[#8b5a3c] drop-shadow-lg">
            Boss House
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-[#8b5a3c]/70">
            Happy paws hub
          </p>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col space-y-3">
            {sidebarGroups.map((group) => (
              <li key={group.id}>
                {group.type === "single" ? (
                  <button
                    onClick={() => setActiveTab(group.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[#f5f3f0]/70 px-5 py-3 text-left text-sm font-medium tracking-wide shadow-sm shadow-[#1a1a16]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8b5a3c]/40 hover:shadow-lg hover:shadow-[#1a1a16]/15 ${
                      activeTab === group.id
                        ? "bg-gradient-to-r from-[#1a1a16] via-[#8b5a3c] to-[#d8ccbf] text-[#f5f3f0] shadow-xl shadow-[#1a1a16]/20"
                        : "text-[#1a1a16]"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ccbf]/70 text-[#1a1a16] shadow-inner shadow-[#f5f3f0]/70 transition group-hover:scale-110">
                      {group.icon}
                    </span>
                    <span>{group.label}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-[#f5f3f0]/70 px-5 py-3 text-sm font-medium tracking-wide text-[#1a1a16] shadow-sm shadow-[#1a1a16]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8b5a3c]/40 hover:text-[#8b5a3c] hover:shadow-lg hover:shadow-[#1a1a16]/15"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ccbf]/70 text-[#1a1a16] shadow-inner shadow-[#f5f3f0]/70 transition group-hover:scale-110">
                          {group.icon}
                        </span>
                        <span className="font-medium">{group.label}</span>
                      </div>
                      {openGroups[group.id] ? <CaretUp size={18} /> : <CaretDown size={18} />}
                    </button>

                    {openGroups[group.id] && (
                      <ul className="ml-4 mt-3 space-y-2 border-l-4 border-[#8b5a3c]/40 pl-4">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveTab(item.id)}
                              className={`group flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                                activeTab === item.id
                                  ? "bg-[#8b5a3c]/85 text-[#f5f3f0] shadow-lg shadow-[#1a1a16]/20"
                                  : "bg-[#f5f3f0]/80 text-[#1a1a16] hover:border-[#8b5a3c]/40 hover:text-[#8b5a3c] hover:shadow-md hover:shadow-[#1a1a16]/10"
                              }`}
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d8ccbf]/70 text-[#1a1a16] shadow-inner shadow-[#f5f3f0]/70 transition group-hover:scale-110">
                                {item.icon}
                              </span>
                              <span className="tracking-wide">{item.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 space-y-3 rounded-3xl border border-[#d8ccbf] bg-[#f5f3f0]/80 p-4 shadow-lg shadow-[#1a1a16]/10">
          <button className="flex w-full items-center gap-3 rounded-2xl bg-[#f5f3f0]/90 px-4 py-3 text-sm font-semibold text-[#1a1a16] shadow-inner shadow-[#1a1a16]/5 transition-all duration-200 hover:-translate-y-0.5  hover:bg-[#8b5a3c] hover:text-[#f5f3f0] hover:shadow-lg hover:shadow-[#1a1a16]/20">
            <Gear size={20} />
            <span>Settings</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-2xl bg-[#f5f3f0]/90 px-4 py-3 text-sm font-semibold text-[#1a1a16] shadow-inner shadow-[#1a1a16]/5 transition-all duration-200 hover:-translate-y-0.5  hover:bg-[#8b5a3c]  hover:text-[#f5f3f0] hover:shadow-lg hover:shadow-[#1a1a16]/20">
            <SignOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        <main
          className="relative flex-1 overflow-hidden  transition-all duration-500"
          // style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="absolute inset-0 " />
          <div className="relative z-10 flex h-full w-full flex-col gap-6 overflow-y-auto rounded-[3rem]  p-8 ">
          
            <div className="">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

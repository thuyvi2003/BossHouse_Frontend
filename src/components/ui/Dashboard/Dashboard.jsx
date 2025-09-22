// Vo Lam Thuy Vi
import { useState } from "react";
import { Search, Mail, Bell, ChevronDown, Play, Settings, LogOut } from "lucide-react";
import PromotionManagement from "./PromotionManagement";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const sidebarItems = [
        { id: "overview", icon: "📊", label: "Overview" },
        { id: "account", icon: "📚", label: "Account" },
        { id: "product", icon: "📄", label: "Product" },
        { id: "promotion", icon: "🎥", label: "Promotion" },
        { id: "booking", icon: "📝", label: "Booking" },
        { id: "post", icon: "📋", label: "Post" },

    ];

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <h2 className="text-2xl font-bold">📊 Overview</h2>;
            case "account":
                return <h2 className="text-2xl font-bold">👤 Account Management</h2>;
            case "product":
                return <h2 className="text-2xl font-bold">🛒 Product Management</h2>;
            case "promotion":
                return <PromotionManagement />;
            case "booking":
                return <h2 className="text-2xl font-bold">📅 Booking Management</h2>;
            case "post":
                return <h2 className="text-2xl font-bold">📝 Post Management</h2>;
            default:
                return <h2 className="text-2xl font-bold">Welcome to Dashboard</h2>;
        }

    }
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-semibold">Boss House</h1>
                </div>

                <nav className="flex-1 px-4">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                                        ? "bg-yellow-600 text-white"
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

                <div className="p-4 border-t border-slate-700">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            {/* Main content */}
            <main className="">{renderContent()}</main>

        </div>
    );
}
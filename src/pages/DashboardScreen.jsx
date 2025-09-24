// Vo Lam Thuy Vi
import { useState } from "react";
import CategoryManagement from "../components/ui/Dashboard/Categories/CategoryManagement";
import ProductManagement from "../components/ui/Dashboard/Products/ProductManagement";
import ProductVariationManagement from "../components/ui/Dashboard/ProductVariations/ProductVariationManagement";
import PromotionManagement from "../components/ui/Dashboard/Promotions/PromotionManagement";
import {
    ChartBar,
    User,
    Package,
    FilmSlate,
    CalendarCheck,
    Note,
    Gear,
    SignOut,
} from "phosphor-react";
import Logo from "@/assets/Logo_BossHouse.png";
import Background from "@/assets/Background_Cat.png"
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const sidebarItems = [
        { id: "overview", icon: <ChartBar size={22} />, label: "Overview" },
        { id: "account", icon: <User size={22} />, label: "Account" },
        { id: "product", icon: <Package size={22} />, label: "Product" },
        { id: "category", icon: <Package size={22} />, label: "Category" },
        { id: "variation", icon: <Package size={22} />, label: "Product Variation" },
        { id: "promotion", icon: <FilmSlate size={22} />, label: "Promotion" },
        { id: "booking", icon: <CalendarCheck size={22} />, label: "Booking" },
        { id: "post", icon: <Note size={22} />, label: "Post" },


    ];

    const renderContent = () => {
        //Import your tab in here to display your component 

        switch (activeTab) {
            case "overview":
                return <h2 className="text-2xl font-bold">📊 Overview</h2>;
            case "account":
                return <h2 className="text-2xl font-bold">👤 Account Management</h2>;
            case "product":
                return <ProductManagement />;
            case "category":
                return <CategoryManagement />;
            case "variation":
                return <ProductVariationManagement />;
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
        <div className="flex h-screen bg-[#f7f7f7]">
            <aside className="w-64 bg-[#222421] text-white flex flex-col">
                <div className="p-6 flex flex-col items-center gap-2">
                    <img
                        src={Logo}
                        alt="Boss House Logo"
                        className="w-18 h-18 object-contain rounded-b-4xl"
                    />
                    <h1 className="text-3xl font-extrabold  tracking-wide fon">Boss House</h1>

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
            <main className="relative shadow-xl overflow-hidden flex-1 animate-fade-in bg-cover bg-center"
                style={{ backgroundImage: `url(${Background})` }}>{renderContent()}</main>

        </div>
    );
}
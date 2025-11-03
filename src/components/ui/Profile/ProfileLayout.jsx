import SidebarProfile from "./SidebarProfile";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <div className="flex  bg-[#f9f5f1]">
      <SidebarProfile /> {/* chỉ render 1 lần */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <Outlet /> {/* ProfilePage hoặc ContactHistory sẽ hiển thị ở đây */}
      </div>
    </div>
  );
}

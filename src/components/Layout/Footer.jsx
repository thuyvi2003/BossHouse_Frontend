import React from "react";
import Background from "@/assets/Background_Dogs.jpg";

export default function Footer() {
  return (
    <footer className="relative shadow-xl overflow-hidden bg-cover bg-center py-16 bg-[#b39069]">
      {/* Nếu muốn dùng ảnh nền thì bật dòng dưới */}
      {/* style={{ backgroundImage: `url(${Background})` }} */}

      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 px-6 text-gray-900">
        {/* Logo + Brand */}
        <div className="col-span-2 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src="/src/assets/LogoFooter.jpg"
                alt="BossHouse Logo"
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide text-gray-900">
              BossHouse
            </h1>
          </div>
        </div>

        {/* Fun */}
        <div>
          <h3 className="font-bold mb-3">Fun</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Hobbies</a></li>
            <li><a href="#" className="hover:text-white">FLO</a></li>
            <li><a href="#" className="hover:text-white">Events</a></li>
            <li><a href="#" className="hover:text-white">Games</a></li>
          </ul>
        </div>

        {/* Meeting */}
        <div>
          <h3 className="font-semibold mb-3">Meeting</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Dates</a></li>
            <li><a href="#" className="hover:text-white">FLO</a></li>
            <li><a href="#" className="hover:text-white">Consulting</a></li>
            <li><a href="#" className="hover:text-white">Groups</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Search</a></li>
            <li><a href="#" className="hover:text-white">Directory</a></li>
            <li><a href="#" className="hover:text-white">Customer</a></li>
            <li><a href="#" className="hover:text-white">Partners</a></li>
          </ul>
        </div>

        {/* Blog */}
        <div>
          <h3 className="font-semibold mb-3">Blog</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Customer</a></li>
            <li><a href="#" className="hover:text-white">Case study</a></li>
            <li><a href="#" className="hover:text-white">News</a></li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-200">
        © {new Date().getFullYear()} BossHouse. All rights reserved.
      </div>
    </footer>
  );
}

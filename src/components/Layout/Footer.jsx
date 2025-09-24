// Vo Lam Thuy Vi
import React from "react";
import Background from "@/assets/Background_Dogs.jpg";

export default function Footer() {
    return (
        <footer className="relative shadow-xl overflow-hidden flex-1 animate-fade-in bg-cover bg-center py-20 bg-[#b39069]">
            {/* // style={{ backgroundImage: `url(${Background})` }} */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-8 text-2xl">
                <div className="md:col-span-2 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-50 h-50 flex items-center justify-center ">
                            <img
                                src="/src/assets/LogoFooter.jpg"
                                alt="BossHouse Logo"
                                className="w-30 h-30 object-cover rounded-full"
                            />
                        </div>
                    </div>


                </div>

                <div>
                    <h3 className="font-bold mb-3">Fun</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Hobbies</a></li>
                        <li><a href="#" className="hover:text-white">FLO</a></li>
                        <li><a href="#" className="hover:text-white">Events</a></li>
                        <li><a href="#" className="hover:text-white">Games</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-3">Meeting</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Dates</a></li>
                        <li><a href="#" className="hover:text-white">FLO</a></li>
                        <li><a href="#" className="hover:text-white">Consulting</a></li>
                        <li><a href="#" className="hover:text-white">Groups</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-3">Contact</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Search</a></li>
                        <li><a href="#" className="hover:text-white">Directory</a></li>
                        <li><a href="#" className="hover:text-white">Customer</a></li>
                        <li><a href="#" className="hover:text-white">Partners</a></li>
                    </ul>
                </div>

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

            <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} BossHouse. All rights reserved.
            </div>
        </footer>
    );
}

import { NavLink } from "react-router-dom";
import { House, SquaresFour, Clock, ListChecks } from "phosphor-react";
export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-[#f9f5f1]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#d7cbbf] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#d7cbbf]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#846551] rounded-lg"></div>
            <span className="font-semibold text-gray-800">Profile UI</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-[#d7cbbf] rounded-lg text-sm focus:outline-none focus:border-[#846551]"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Navigation */}
       <nav className="flex-1 px-4 space-y-1">
      <NavLink
        to="/"
        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg"
      >
        <House size={20} weight="duotone" />
        <span className="text-sm">Home</span>
      </NavLink>
      <NavLink
        to="/dashboard"
        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg"
      >
        <SquaresFour size={20} weight="duotone" />
        <span className="text-sm">Dashboard</span>
      </NavLink>
      <NavLink
        to="/orders"
        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg"
      >
        <ListChecks size={20} weight="duotone" />
        <span className="text-sm">Order History</span>
      </NavLink>
      <NavLink
        to="/schedule"
        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg"
      >
        <Clock size={20} weight="duotone" />
        <span className="text-sm">Schedule</span>
      </NavLink>
    </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-[#d7cbbf] space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm">Support</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#f9f5f1] rounded-lg cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">Settings</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#d7cbbf] flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">Olivia Rhye</div>
            <div className="text-xs text-gray-500">olivia@bosshouse.com</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header with gradient BossHouse style */}
        <div className="h-48 bg-gradient-to-br from-[#d7cbbf] via-[#f9f5f1] to-[#846551] relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d7cbbf] opacity-40 rounded-full blur-3xl"></div>
        </div>

        {/* Profile Content */}
        <div className="max-w-5xl mx-auto px-8 mt-20">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Olivia Rhye</h1>
                    <p className="text-gray-500">I'm a Product Designer based in Melbourne.</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience</h2>
              <p className="text-gray-600">I specialise in UX/UI design, brand strategy, and Webflow development.</p>
            </div>

            {/* About Section */}
            <div className="mt-8 grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About me</h2>
                <p className="text-gray-600 mb-4">
                  I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and
                  Webflow development. I'm always striving to grow and learn something new and I don't take myself too seriously.
                </p>
                <p className="text-gray-600 mb-4">
                  I'm passionate about helping startups grow, improve their customer experience, and to raise venture capital
                  through good design.
                </p>
                <button className="text-[#846551] font-medium hover:text-[#5a3e2d]">Read more</button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇦🇺</span>
                    <span className="text-gray-900">Melbourne, Australia</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Portfolio</h3>
                  <a href="#" className="text-[#846551] hover:text-[#5a3e2d] flex items-center gap-1">
                    @oliviarhye
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="grid grid-cols-3 gap-6 pb-8">
            {/* Project 1 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-[#d7cbbf] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#846551]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Lead Product Designer</h3>
              <p className="text-sm text-gray-500 mb-4">Layers</p>
              <p className="text-sm text-gray-600 mb-4">May 2020 – Present</p>
              <button className="text-[#846551] text-sm font-medium hover:text-[#5a3e2d]">View project</button>
            </div>

            {/* Project 2 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-[#d7cbbf] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#846551]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Product Designer</h3>
              <p className="text-sm text-gray-500 mb-4">Sisyphus</p>
              <p className="text-sm text-gray-600 mb-4">Jan 2018 – May 2020</p>
              <button className="text-[#846551] text-sm font-medium hover:text-[#5a3e2d]">View project</button>
            </div>

            {/* Project 3 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-[#d7cbbf] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#846551]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">UX Designer</h3>
              <p className="text-sm text-gray-500 mb-4">Catalog</p>
              <p className="text-sm text-gray-600 mb-4">Mar 2017 – Jan 2018</p>
              <button className="text-[#846551] text-sm font-medium hover:text-[#5a3e2d]">View project</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

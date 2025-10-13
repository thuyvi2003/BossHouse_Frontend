export default function ProfilePage() {
  return (
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
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience</h2>
            <p className="text-gray-600">
              I specialise in UX/UI design, brand strategy, and Webflow development.
            </p>
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
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="grid grid-cols-3 gap-6 pb-8">
          {/* Project 1 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Lead Product Designer</h3>
            <p className="text-sm text-gray-500 mb-4">Layers</p>
            <p className="text-sm text-gray-600 mb-4">May 2020 – Present</p>
          </div>

          {/* Project 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Product Designer</h3>
            <p className="text-sm text-gray-500 mb-4">Sisyphus</p>
            <p className="text-sm text-gray-600 mb-4">Jan 2018 – May 2020</p>
          </div>

          {/* Project 3 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">UX Designer</h3>
            <p className="text-sm text-gray-500 mb-4">Catalog</p>
            <p className="text-sm text-gray-600 mb-4">Mar 2017 – Jan 2018</p>
          </div>
        </div>
      </div>
    </div>
  );
}

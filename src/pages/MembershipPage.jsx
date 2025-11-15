import { useEffect, useState } from "react";
import { getMemberships } from "@/services/membershipService";
import { getProfile } from "@/services/profileService";
import { Medal, Star } from "phosphor-react";

export default function MembershipPage() {
  const [memberships, setMemberships] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Lấy profile và memberships song song
        const [profileRes, membershipsRes] = await Promise.all([
          getProfile(),
          getMemberships(1, 20, ""),
        ]);

        const userPoints = profileRes.user?.membership_points ?? 0;
        const list = membershipsRes.data || [];

        // Sắp xếp theo điểm tăng dần
        const sortedList = [...list].sort((a, b) => (a.point ?? 0) - (b.point ?? 0));

        // Tìm rank hiện tại: membership có point <= userPoints và lớn nhất
        const activeRank = sortedList
          .filter((item) => typeof item.point === "number")
          .reduce((acc, item) => {
            if (userPoints >= item.point) return item;
            return acc;
          }, null);

        setProfile({ ...profileRes.user, points: userPoints });
        setMemberships(sortedList);
        setCurrentMembership(activeRank);
      } catch (err) {
        console.error("Failed to load memberships:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading membership information...</div>
      </div>
    );
  }

  const currentRankName = currentMembership?.name ?? "New member";
  const currentPoints = profile?.points ?? 0;

  return (
    <div className="space-y-6">
      {/* Current Membership Status Card */}
      {profile && (
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1f3bb3]/10 flex items-center justify-center flex-shrink-0">
              <Medal size={32} weight="fill" className="text-[#1f3bb3]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <p className="text-sm font-semibold text-[#d62839] mt-1">
                {currentPoints.toLocaleString()} points
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#1f3bb3] to-[#3b5bdb] text-white text-sm font-semibold shadow-md">
                <Medal size={18} weight="fill" /> {currentRankName}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Instruction Box */}
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          Start your membership rank by making an order
        </p>
      </div>

      {/* Update Benefits Button */}
      <button className="w-full bg-[#1f3bb3] hover:bg-[#3b5bdb] text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
        <Star size={20} weight="fill" />
        UPDATE ZMEMBER MEMBERSHIP BENEFITS
      </button>

      {/* Membership Rank and Benefits Table */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <header className="mb-4">
          <h2 className="text-2xl font-bold text-[#1f3bb3]">Membership Benefits</h2>
        </header>

        <div className="overflow-hidden border border-[#1f3bb3] rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-[#1f3bb3] text-white uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Point</th>
                <th className="py-3 px-4 text-left">Voucher</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberships.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    No membership tiers available
                  </td>
                </tr>
              ) : (
                memberships.map((item) => {
                  const isActive = currentMembership?._id === item._id;
                  return (
                    <tr
                      key={item._id}
                      className={
                        isActive
                          ? "bg-[#1f3bb3]/10 font-semibold text-[#1f3bb3] border-l-4 border-[#1f3bb3]"
                          : "hover:bg-gray-50 transition-colors"
                      }
                    >
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {isActive && <Medal size={16} weight="fill" className="text-[#1f3bb3]" />}
                          {item.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.point?.toLocaleString() ?? "0"}</td>
                      <td className="py-3 px-4">{item.description}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
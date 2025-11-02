//Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { FolderHeart, Share2 } from "lucide-react";
import { getWishlistGroups, shareWishlistGroup } from "@/services/wishListService";
import SelectGroup from "./SelectGroup";
import ShareLinkModal from "./ShareLinkModal";

const WishlistGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
    const [shareLink, setShareLink] = useState("");
      const [loadingId, setLoadingId] = useState(null);



  useEffect(() => {
    (async () => {
      const res = await getWishlistGroups();
      console.log("hehehehhehehehehhdoumaa",res.data)
      if (res.status === "success") setGroups(res.data);
    })();
  }, []);
const handleShare = async (e, groupId) => {
    e.stopPropagation(); 
    try {
      setLoadingId(groupId);
      const res = await shareWishlistGroup(groupId, "public");
      if (res.success) setShareLink(res.share_url);
    } catch (err) {
      console.error("Share failed:", err);
      alert("Cannot share wishlist group!");
    } finally {
      setLoadingId(null);
    }
  };
  if(selectedGroup){
    return (
      <SelectGroup group = {selectedGroup} onBack = {() =>setSelectedGroup(null)} />
    )
  }
  return (
    <div className="min-h-screen bg-[#fdfcfb] py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#5a4639] flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-[#846551]" /> Wishlist Groups
          </h1>
          <Link
            to="/profile/wishlist/"
            className="text-[#846551] hover:underline font-medium"
          >
            ← Back to Wishlist
          </Link>
        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            You don’t have any groups yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((g) => (
              <div
                key={g._id}
                className="p-6 border border-[#d7cbbf] rounded-xl hover:shadow-md transition-all"
                onClick={() => setSelectedGroup(g)}
              >
                <h3 className="text-lg font-semibold text-[#5a4639] mb-1">
                  {g.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{g.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Created: {dayjs(g.created_at).format("DD/MM/YYYY")}
                  </span>
                 <button
                    onClick={(e) => handleShare(e, g._id)}
                    className="text-[#846551] hover:text-[#5a4639] flex items-center gap-1"
                  >
                    {loadingId === g._id ? (
                      <span className="text-xs animate-pulse">Sharing...</span>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" /> Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            <ShareLinkModal link={shareLink} onClose={() => setShareLink("")} />

    </div>
  );
};

export default WishlistGroupsPage;

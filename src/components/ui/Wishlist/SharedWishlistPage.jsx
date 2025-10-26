// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import { FolderHeart, ShoppingBag } from "lucide-react";
import { getSharedWishlistGroup } from "@/services/wishListService";

const SharedWishlistPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getSharedWishlistGroup(groupId);
        if (res.success) setGroup(res.data);
        else setError(res.message || "Group not found or not shared");
      } catch (err) {
        setError("Failed to load shared wishlist group");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[#846551]">
        Loading shared wishlist...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <h2 className="text-xl font-semibold mb-2">❌ {error}</h2>
        <Link
          to="/"
          className="text-[#846551] hover:underline text-sm font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfcfb] py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#5a4639] flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-[#846551]" />{" "}
            {group.name || "Shared Wishlist"}
          </h1>
          <Link
            to="/"
            className="text-[#846551] hover:underline font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <p className="text-gray-600 mb-6">{group.description}</p>
        <p className="text-sm text-gray-500 mb-8">
          Shared on {dayjs(group.updatedAt).format("DD/MM/YYYY")} • Visibility:{" "}
          <span className="font-medium">{group.visibility}</span>
        </p>

        {group.items?.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            This wishlist is empty.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {group.items.map((item) => (
              <div
                key={item._id}
                className="p-5 border border-[#d7cbbf] rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.product_variation_id?.product_id?.thumbnail ||
                      "/placeholder.png"
                    }
                    alt={item.product_variation_id?.product_id?.name || "Product"}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div>
                    <h3 className="font-semibold text-[#5a4639]">
                      {item.product_variation_id?.product_id?.name || "Unnamed Product"}
                    </h3>
                    <p className="text-sm text-gray-500">{item.note}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm text-gray-500">
                  <span>
                    Added: {dayjs(item.created_at).format("DD/MM/YYYY")}
                  </span>
                  <a
                    href={`/product/${item.product_variation_id?.product_id?._id}`}
                    className="text-[#846551] hover:underline flex items-center gap-1"
                  >
                    <ShoppingBag className="w-4 h-4" /> View Product
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWishlistPage;

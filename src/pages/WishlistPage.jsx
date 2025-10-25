import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowLeft, Heart, X } from "lucide-react";
import Toast from "@/components/Layout/Toast";
import { getWishlist } from "@/services/wishListService";
import Pagination from "@/components/Layout/Pagination";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWishlist = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getWishlist(pageNum, limit);
      if (res.status === "success") {
        setWishlist(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      setToast({
        type: "error",
        title: "Failed!",
        message:
          error.response?.data.message || "Failed to fetch wishlist.",
        
      });
      console.log(toast)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);


  return (
    <div className="min-h-screen ">
      {/* Breadcrumb Header */}
      <div className="py-12 text-center border-b bg-gradient-to-b from-[#fff8ef] to-[#f5f3f2]">
        <h1 className="text-4xl font-bold text-[#5a4639] mb-2 tracking-wide animate-fade-in">
          Wishlist
        </h1>
        <p className="text-sm text-gray-500">
          <Link to="/" className="hover:text-[#846551] transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#846551] font-medium">Wishlist</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-10xl mx-auto px-4 py-12 animate-fade-in-up ">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg">Your wishlist is empty.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="rounded-lg overflow-hidden shadow-sm bg-[#d7cbbf] grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-[#5a4639] tracking-wide">
              <div className="col-span-1"></div>
              <div className="col-span-4">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Date Added</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#f0e8df] bg-white rounded-b-xl">
              {wishlist.map((item, i) => {
                const v = item.product_variation_id;
                return (
                  <div
                    key={item._id}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-all duration-300 hover:bg-[#f5f3f2] hover:shadow-md ${
                      i % 2 === 0 ? "bg-[#fff]" : "bg-[#fdfcfb]"
                    }`}
                  >
                    {/* Remove */}
                    <div className="col-span-1">
                      <button className="text-gray-400 hover:text-red-500 transition-transform hover:scale-110">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="col-span-4 flex items-center gap-4">
                      <Link to={`/product/${v?.product_id}`}>
                        <img
                          src={v?.image || "/placeholder.png"}
                          alt={v?.name}
                          className="w-20 h-20 object-cover rounded-lg border border-[#d7cbbf] hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/product/${v?.product_id}`}
                          className="font-semibold text-[#5a4639] hover:text-[#846551] transition-colors"
                        >
                          {v?.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          SKU: {v?.sku}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <span className="text-[#846551] font-semibold">
                        {v?.price?.toLocaleString()}₫
                      </span>
                    </div>

                    {/* Date Added */}
                    <div className="col-span-2 text-center text-sm text-gray-600">
                      {new Date(item.created_at || item.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          v?.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {v?.status === "active" ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    {/* Add to Cart */}
                    <div className="col-span-1 flex justify-end">
                      <button className="bg-gradient-to-r from-[#846551] to-[#5a4639] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="mt-10 flex justify-between items-center">
              <button className="border border-[#d7cbbf] text-[#5a4639] px-6 py-2 rounded-lg font-medium hover:bg-[#f5f3f2] hover:shadow-sm transition-all">
                Clear Wishlist
              </button>
              <button className="bg-yellow-400 text-white px-6 py-2 rounded-lg font-medium hover:shadow-md hover:scale-105 transition-transform">
                Add All to Cart
              </button>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchWishlist(p)}
            />
          </>
        )}
      </div>

      {toast && <Toast type={toast.type} title={toast.title} message={toast?.message} onClose={  () => {
            setToast(null)
          }}/>}
    </div>
  );
};

export default WishlistPage;

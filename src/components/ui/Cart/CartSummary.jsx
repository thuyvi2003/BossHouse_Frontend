// Vo Lam Thuy Vi
import React, { useState, useEffect } from "react";
import { getUserClaimedPromotions } from "@/services/promotionService";

export default function CartSummary({ total, count }) {
  const shipping = count > 0 ? 5000 : 0;
  const finalTotal = total + shipping;
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const fetchPromotions = async () => {
    try {
      const res = await getUserClaimedPromotions();
      console.log("Day la ds promotion cua user", res)
      setPromotions(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch promotions:", error.message);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleApplyPromotion = async (promo) => {
  try {
    const res = await applyPromotion(promo._id);
    alert("Promotion applied successfully!");
    console.log("Cart updated:", res.data);
  } catch (error) {
    alert(error.response?.data?.message || "Failed to apply promotion");
  }
};
  return (
    <div className="p-6 bg-[#fdfaf6] border border-gray-200 rounded shadow-sm">
      <h2 className="text-lg font-light mb-4 text-gray-700 tracking-wide uppercase">
        Order Summary
      </h2>

      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
        <span className="text-gray-600">{count} Products</span>
        <span className="text-gray-700">{total}đ</span>
      </div>

      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
        <span className="text-gray-600">Shipping</span>
        <span className="text-gray-700">{shipping}đ</span>
      </div>

      {/* Danh sách khuyến mãi */}
      <div className="mt-4 border-b border-gray-200 pb-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Available Promotions
        </h3>

        {promotions.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {promotions.map((promo) => (
              <div
                key={promo._id}
                onClick={() => setSelectedPromo(promo)}
                className={`p-3 text-sm border rounded cursor-pointer transition ${selectedPromo?._id === promo._id
                    ? "border-[#846551] bg-[#f8f4f0]"
                    : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <div className="font-medium text-gray-800">
                  {promo.description || promo.code}
                </div>
                <div className="text-xs text-gray-500">
                  {promo.promotion_type === "percent"
                    ? `Giảm ${promo.promotion_value}%`
                    : `Giảm ${promo.promotion_value}đ`}
                </div>
                <button
                  onClick={() => handleApplyPromotion(promo)}
                  disabled={selectedPromo?._id === promo._id}//nút của mã đã được chọn sẽ bị khóa (disabled),không cho click lại.
                  className={`text-xs px-3 py-1 rounded ${selectedPromo?._id === promo._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#846551] text-white hover:bg-[#6d5041]"
                    }`}
                >
                  {selectedPromo?._id === promo._id ? "Applied" : "Apply"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No promotions available
          </p>
        )}

      </div>

      {/* Tổng tiền */}
      <div className="flex justify-between font-medium py-3 mt-2 bg-[#f3eee7] px-2 rounded">
        <span>Total</span>
        <span>{finalTotal}đ</span>
      </div>

      <button className="mt-6 w-full bg-black text-white py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition">
        Checkout
      </button>
    </div>
  );
}

// Vo Lam Thuy Vi
import React, { useState, useEffect } from "react";
import { applyPromotion, getUserClaimedPromotions } from "@/services/promotionService";
import { Navigate, useNavigate } from "react-router-dom";
import Toast from "@/components/Layout/Toast";

export default function CartSummary({ total, count }) {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [finalTotal, setFinalTotal] = useState(total)
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  //Fetch ds promotion 
  const fetchPromotions = async () => {
    try {
      const res = await getUserClaimedPromotions();
      setPromotions(res.data?.data || []);
      console.log("Promotion of user ",res.data.data)
    } catch (error) {
      console.error("Failed to fetch promotions:", error.message);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);




  useEffect(() => {
    let newTotal = Number(total) ;
    const promoValue = Number(selectedPromo?.value || selectedPromo?.promotion_value || 0);
    if (selectedPromo) {
      if (selectedPromo.type === "percent") {
        newTotal = newTotal * (1 - promoValue / 100);
      } else {
        newTotal = Math.max(newTotal - promoValue, 0);
      }
    }
    setFinalTotal(newTotal);
  }, [total, selectedPromo]);




  const handleApplyPromotion = async (promo) => {
    try {
      await applyPromotion(promo._id);

      setToast({
        type: "success",
        title: "Success!",
        message: "Promotion applied successfully",
      });
      setSelectedPromo(promo);
    } catch (error) {
      setToast({
        type: "error",
        title: "Failed!",
        message: error.response?.data?.message || "Failed to apply promotion",
      });
      console.log("erorrrrrrrrrrr", error)
    }
  };

//Chua lam toi
  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        total: finalTotal,
        promotion: selectedPromo,
      }
    })
  }


  return (
    <div className="p-6 bg-[#fdfaf6] border border-gray-200 rounded shadow-sm">
      <h2 className="text-lg font-light mb-4 text-gray-700 tracking-wide uppercase">
        Order Summary
      </h2>

      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
        <span className="text-gray-600">{count} Products</span>
        <span className="text-gray-700">{total.toLocaleString()}đ</span>
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
                className={`p-3 text-sm border rounded cursor-pointer transition ${selectedPromo?._id === promo._id
                  ? "border-[#846551] bg-[#f8f4f0]"
                  : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <div className="font-medium text-gray-800">
                  {promo.description || promo.code}
                </div>
                <div className="text-xs text-gray-500">
                  {promo.type === "percent"
                    ? `Reduce ${promo.value}%`
                    : `Reduce ${promo.value.toLocaleString()}đ`}
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
        <span>{finalTotal.toLocaleString("vi-VN")}đ</span>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-6 w-full bg-black text-white py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition">
        Checkout
      </button>

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

    </div>

  );

}

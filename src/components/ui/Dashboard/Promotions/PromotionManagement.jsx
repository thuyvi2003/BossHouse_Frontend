// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import CreatePromotionModal from "./CreatePromotionModal";
import { Airplane, Tag } from "phosphor-react";

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    promotion_type: "percent",
    promotion_value: "",
    expires_at: "",
    is_hidden: false,
  })

  useEffect(() => {
    setPromotions([
      {
        _id: "1",
        code: "SALE50",
        description: "Giảm 50% tối đa 100k",
        promotion_type: "percent",
        promotion_value: 50,
        expires_at: "2025-12-31",
        is_hidden: false,
      },
      {
        _id: "2",
        code: "FREESHIP",
        description: "Miễn phí vận chuyển",
        promotion_type: "fixed",
        promotion_value: 20000,
        expires_at: "2025-11-30",
        is_hidden: true,
      },
      {
        _id: "3",
        code: "SHIP20K",
        description: "Giảm phí ship 20k",
        promotion_type: "fixed",
        promotion_value: 20000,
        expires_at: "2025-12-15",
        is_hidden: false,
      },
      {
        _id: "4",
        code: "VIP10",
        description: "Giảm 10% cho khách VIP",
        promotion_type: "percent",
        promotion_value: 10,
        expires_at: "2025-12-31",
        is_hidden: false,
      },
    ]);
  }, []);

  const handleCreatePromotion = (newForm) => {
    const newPromotion = {
      _id: Date.now().toString(),
      ...newForm,
      promotion_value: Number(newForm.promotion_value),
    }
    setPromotions([...promotions, newPromotion]);
    setForm({
      code: "",
      description: "",
      promotion_type: "percent",
      promotion_value: "",
      expires_at: "",
      is_hidden: false,
    });
    setShowModal(false);
  }
  return (
    <div className="bg-white  shadow-xl overflow-hidden flex-1  animate-fade-in">
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Tag size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Promotion Management
          </span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          + Create Promotion
        </button>
      </div>


      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
        <div className="col-span-2">Code</div>
        <div className="col-span-3">Description</div>
        <div className="col-span-1">Type</div>
        <div className="col-span-1">Value</div>
        <div className="col-span-2">Expires At</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-transparent">
        {promotions.map((promo, idx) => (
          <div
            key={promo._id}
            className={`
        relative px-6 py-5 grid grid-cols-12 gap-4 items-center
        bg-white rounded-xl shadow-sm border border-gray-100
        hover:border-[#846551] hover:shadow-lg hover:scale-[1.01]
        transition-all duration-300 ease-in-out
        animate-fade-in-up
      `}
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            {/* Decorative left bar */}
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>

            <div className="col-span-2 font-semibold text-gray-900">{promo.code}</div>
            <div className="col-span-3 text-sm text-gray-600">{promo.description}</div>
            <div className="col-span-1 text-sm capitalize text-gray-500">{promo.promotion_type}</div>
            <div className="col-span-1 text-sm text-gray-800 font-semibold">
              {promo.promotion_type === "percent"
                ? `${promo.promotion_value}%`
                : `${promo.promotion_value.toLocaleString()}đ`}
            </div>
            <div className="col-span-2 text-sm text-gray-600">{promo.expires_at}</div>
            <div>
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${promo.is_hidden
                  ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                  : "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                  }`}
              >
                {promo.is_hidden ? "Hidden" : "Active"}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-center space-x-3">
              <button className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300
">
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <CreatePromotionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreatePromotion}
        form={form}
        setForm={setForm}
      />
    </div>
  );
};

export default PromotionManagement;

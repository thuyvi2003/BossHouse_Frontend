// Vo Lam Thuy Vi
import React from "react";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";

const SelectGroup = ({ group, onBack }) => {
  if (!group) return null;

  return (
    <div className="min-h-screen bg-[#fdfcfb] py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#846551] hover:underline"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Groups
          </button>
          <h2 className="text-2xl font-bold text-[#5a4639]">
            {group.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">{group.description}</p>

        {/* Items */}
        {group.items?.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            This group has no items yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {group.items.map((item) => {
              const v = item.product_variation_id || item;
              return (
                <div
                  key={item._id || v._id}
                  className="flex gap-4 p-5 border border-[#e5dcd3] rounded-lg hover:shadow-md transition-all"
                >
                  <img
                    src={v?.image || "/placeholder.png"}
                    alt={v?.name}
                    className="w-20 h-20 rounded-lg object-cover border border-[#d7cbbf]"
                  />
                  <div className="flex-1">
                    <h3 className="text-[#5a4639] font-semibold text-base">
                      {v?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {v?.price?.toLocaleString()}₫
                    </p>
                    <p className="text-xs text-gray-500">
                      Added:{" "}
                      {dayjs(item.created_at || v.created_at).format(
                        "DD/MM/YYYY"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectGroup;

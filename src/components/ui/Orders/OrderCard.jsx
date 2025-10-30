import React from "react";
import dayjs from "dayjs";

export default function OrderCard({ order, onViewDetail }) {
  const firstItem = order.items?.[0];

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    processing: "bg-orange-100 text-orange-700",
    shipping: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }[order.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="border rounded-lg bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-semibold text-[#846551]">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500">
            {dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${statusColor}`}>
          {order.status}
        </span>
      </div>

      {firstItem && (
        <div className="flex items-center gap-4 mt-3">
          <img
            src={firstItem.variation_id.image || "/placeholder.png"}
            alt={firstItem.product_name}
            className="w-16 h-16 rounded object-cover border"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {firstItem.product_name}
            </p>
            <p className="text-xs text-gray-500">Qty: {firstItem.quantity}</p>
            {order.items.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                +{order.items.length - 1} more items
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#5a4639]">
              {order.final_price.toLocaleString("vi-VN")}đ
            </p>
            <button
              onClick={onViewDetail}
              className="mt-2 text-xs text-[#846551] underline hover:text-[#5a4639]"
            >
              View Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import dayjs from "dayjs";

import OrderStatusTracker from "./OrderStatusTracker";

export default function OrderDetailModal({ order, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-[#5a4639] mb-4">
                    Order Details
                </h2>

                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        <strong>Order ID:</strong> {order._id}
                    </p>
                    {/* <p>
                        <strong>Status:</strong>{" "}
                        <span className="capitalize">{order.status}</span>
                    </p> */}
                    <p>
                        <strong>Payment:</strong> {order.payment_method} (
                        {order.payment_status})
                    </p>
                    <p>
                        <strong>Date:</strong>{" "}
                        {dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>


                <OrderStatusTracker
                    status={order.status}
                    createdAt={order.created_at}
                />
                <div className="mt-6 border-t pt-5">
                    <h3 className="font-semibold text-[#5a4639] text-lg mb-3">Products</h3>
                    <ul className="divide-y divide-gray-100">
                        {order.items?.map((i, idx) => {
                            const img =
                                i?.variation_id?.image ||
                                i?.variation_id?.images?.[0] ||
                                i?.variation_id?.product_id?.images?.[0] ||
                                "/placeholder.png";

                            return (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <img
                                            src={img}
                                            alt={i.product_name}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-medium text-gray-800 leading-tight">
                                                {i.product_name}
                                            </p>
                                            {i.variation_id?.name && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {i.variation_id.name}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Qty: {i.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* right: price */}
                                    <div className="text-right min-w-[100px]">
                                        <p className="font-semibold text-[#846551] text-sm">
                                            {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {i.price.toLocaleString("vi-VN")}đ / item
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>


               {/* ---------- ORDER SUMMARY ---------- */}
<div className="mt-6 border-t pt-5">
  <h3 className="font-semibold text-[#5a4639] text-lg mb-3">Order Summary</h3>
  <div className="bg-[#faf9f7] rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex justify-between text-sm text-gray-700 mb-2">
      <span>Subtotal</span>
      <span className="font-medium">
        {order.subtotal?.toLocaleString("vi-VN")}đ
      </span>
    </div>
    <div className="flex justify-between text-sm text-gray-700 mb-2">
      <span>Shipping</span>
      <span className="font-medium">
        {order.shipping_fee?.toLocaleString("vi-VN")}đ
      </span>
    </div>
    <div className="flex justify-between text-sm text-gray-700 mb-2">
      <span>Discount</span>
      <span className="font-medium text-green-600">
        -{order.discount_amount?.toLocaleString("vi-VN")}đ
      </span>
    </div>

    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
      <span className="font-semibold text-gray-800 text-base">Total</span>
      <span className="text-lg font-bold text-[#846551]">
        {order.final_price.toLocaleString("vi-VN")}đ
      </span>
    </div>
  </div>
</div>

{/* ---------- SHIPPING ADDRESS ---------- */}
<div className="mt-6 border-t pt-5">
  <h3 className="font-semibold text-[#5a4639] text-lg mb-3">Shipping Address</h3>
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-sm text-gray-700">
    <p className="font-medium text-gray-800 mb-1">
      {order.shipping_address?.name}
    </p>
    <p className="text-gray-600 text-sm mb-2">
      Phone number:  {order.shipping_address?.phone}
    </p>
    <p className="text-gray-600 leading-relaxed">
      {order.shipping_address?.address}
      <br />
      {order.shipping_address?.city}, {order.shipping_address?.country}
    </p>
  </div>
</div>

            </div>
        </div>
    );
}

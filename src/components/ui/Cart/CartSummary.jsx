// Vo Lam Thuy Vi
import React from "react";

export default function CartSummary({ total, count }) {
  const shipping = count > 0 ? 5000 : 0; // ví dụ
  const finalTotal = total + shipping;

  return (
    <div className="p-6 bg-[#fdfaf6] border border-gray-200 rounded shadow-sm">
      <h2 className="text-lg font-light mb-4 text-gray-700 tracking-wide uppercase">
        Order Summary
      </h2>

      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
        <span className="text-gray-600">{count} Products</span>
        <span className="text-gray-700">{total.toLocaleString()}đ</span>
      </div>

      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
        <span className="text-gray-600">Shipping</span>
        <span className="text-gray-700">{shipping.toLocaleString()}đ</span>
      </div>

      <div className="flex justify-between font-medium py-3 mt-2 bg-[#f3eee7] px-2 rounded">
        <span>Total</span>
        <span>{finalTotal.toLocaleString()}đ</span>
      </div>

      <button className="mt-6 w-full bg-black text-white py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition">
        Checkout
      </button>
    </div>
  );
}

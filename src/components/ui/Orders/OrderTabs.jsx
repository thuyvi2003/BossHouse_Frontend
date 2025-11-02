import React from "react";

const statuses = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "shipping", label: "Shipping" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrderTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-2">
      {statuses.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`px-4 py-2 text-sm rounded-full border transition ${
            active === s.key
              ? "bg-[#846551] text-white border-[#846551]"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

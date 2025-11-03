import React from "react";
import dayjs from "dayjs";
import { Check, Package, Box, Truck, ClipboardCheck } from "lucide-react";

const steps = [
  { key: "pending", label: "Order Placed", icon: <Package className="w-4 h-4" /> },
  { key: "paid", label: "Accepted", icon: <Check className="w-4 h-4" /> },
  { key: "processing", label: "In Progress", icon: <Box className="w-4 h-4" /> },
  { key: "shipping", label: "On the Way", icon: <Truck className="w-4 h-4" /> },
  { key: "completed", label: "Delivered", icon: <ClipboardCheck className="w-4 h-4" /> },
];

export default function OrderStatusTracker({ status, createdAt }) {
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6">
      {/* background line */}
      <div className="absolute top-6 left-0 w-full h-[3px] bg-gray-200 -z-10" />

      {/* filled line */}
      <div
        className="absolute top-6 left-0 h-[3px] bg-green-700 -z-10 transition-all duration-700 ease-in-out"
        style={{
          width: `${(currentIndex / (steps.length - 1)) * 100}%`,
        }}
      />

      {/* steps */}
      <div className="flex justify-between items-start">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isDone = idx < currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center w-20">
              {/* icon node */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  isActive
                    ? "bg-green-700 border-green-700 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                } transition-all duration-300`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.icon}
              </div>

              {/* label */}
              <p
                className={`text-[13px] font-medium mt-2 ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {/* time below */}
              <p className="text-[11px] text-gray-400 mt-1">
                {idx <= currentIndex
                  ? dayjs(createdAt).add(idx * 15, "minute").format("DD MMM YYYY HH:mm")
                  : "Expected"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

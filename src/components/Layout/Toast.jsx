// Vo Lam Thuy Vi
import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const Toast = ({ type = "success", title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  console.log("mes",message)
  const styles = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div
        className={`flex items-center justify-between gap-3 rounded-full px-5 py-3 shadow-lg min-w-[320px] ${style.bg}`}
      >
        {/* Icon + nội dung */}
        <div className="flex items-center gap-3">
          {style.icon}
          <div className="flex flex-col">
            <span className={`font-semibold ${style.text}`}>{title}</span>
            <span className="text-sm text-gray-500">{message}</span>
          </div>
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Toast;

// Vo Lam Thuy Vi
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const ShareLinkModal = ({ link, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!link) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-[90%] md:w-[500px] shadow-xl text-center">
        <h2 className="text-xl font-semibold text-[#5a4639] mb-4">
          Share Wishlist Link
        </h2>
        <div className="flex items-center justify-between border border-[#d7cbbf] rounded-lg p-2">
          <input
            value={link}
            readOnly
            className="flex-1 outline-none text-gray-700 px-2"
          />
          <button
            onClick={handleCopy}
            className="text-[#846551] hover:text-[#5a4639] px-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-[#846551] text-white rounded-md hover:bg-[#5a4639]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareLinkModal;

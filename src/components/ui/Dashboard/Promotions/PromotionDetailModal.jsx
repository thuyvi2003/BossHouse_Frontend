// Vo Lam Thuy Vi
import React from "react";
import { Tag, Calendar, Info, Percent, Coins } from "phosphor-react";
import dayjs from "dayjs";

export default function PromotionDetailModal({ isOpen, onClose, promotion }) {
    if (!isOpen || !promotion) return null;

    const statusColor = promotion.is_hidden
        ? "from-red-100 to-red-200 text-red-700"
        : "from-green-100 to-green-200 text-green-700";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-fade-in-up relative overflow-hidden">
                {/* Decorative gradient ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f1ebe7] to-[#d7cbbf] opacity-30 pointer-events-none"></div>

                {/* Header */}
                <div className="relative flex items-center gap-3 mb-6">
                    <Tag size={28} weight="bold" className="text-[#846551]" />
                    <h3 className="text-2xl font-extrabold text-[#846551] drop-shadow-sm">
                        Promotion Detail
                    </h3>
                </div>

                {/* Detail Info */}
                <div className="relative space-y-4">
                    <DetailRow
                        icon={<Info size={20} className="text-[#846551]" />}
                        label="Code"
                        value={promotion.code}
                    />
                    <DetailRow
                        icon={<Info size={20} className="text-[#846551] font-semibold text-right max-w-[60%] break-words leading-relaxed" />}
                        label="Description"
                        value={promotion.description}
                    />
                    <DetailRow
                        icon={<Percent size={20} className="text-[#846551]" />}
                        label="Type"
                        value={promotion.promotion_type}
                    />
                    <DetailRow
                        icon={<Coins size={20} className="text-[#846551]" />}
                        label="Value"
                        value={
                            promotion.promotion_type === "percent"
                                ? `${promotion.promotion_value}%`
                                : `${promotion.promotion_value?.toLocaleString()}đ`
                        }
                    />
                    <DetailRow
                        icon={<Calendar size={20} className="text-[#846551]" />}
                        label="Expires At"
                        value={promotion.expires_at ? dayjs(promotion.expires_at).format("DD/MM/YYYY") : "—"}
                    />

                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium text-[#846551]">Status</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${statusColor} shadow`}
                        >
                            {promotion.is_hidden ? "Hidden" : "Active"}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-[#846551] text-white font-semibold shadow hover:bg-[#6d5142] hover:scale-105 transition-transform duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

const DetailRow = ({ icon, label, value }) => (
    <div className="flex justify-between items-center border-b border-[#e5d8cd] pb-2">
        <div className="flex items-center gap-2 text-[#846551]">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <span className="text-gray-800 font-semibold">{value}</span>
    </div>
);

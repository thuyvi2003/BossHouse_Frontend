// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
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
                code: "FREESHIP",
                description: "Miễn phí vận chuyển",
                promotion_type: "fixed",
                promotion_value: 20000,
                expires_at: "2025-11-30",
                is_hidden: true,
            },
            {
                _id: "4",
                code: "FREESHIP",
                description: "Miễn phí vận chuyển",
                promotion_type: "fixed",
                promotion_value: 20000,
                expires_at: "2025-11-30",
                is_hidden: true,
            },

        ])
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-screen">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Promotion Management</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    + Create Promotion
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-2">Code</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Value</div>
                <div className="col-span-2">Expires At</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
                {promotions.map((promo) => (
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-2 font-medium text-gray-900">{promo.code}</div>
                            <div className="col-span-3 text-sm text-gray-600">{promo.description}</div>
                            <div className="col-span-1 text-sm text-gray-600">{promo.promotion_type}</div>
                            <div className="col-span-1 text-sm text-gray-600">
                                {promo.promotion_type === "percent"
                                    ? `${promo.promotion_value}%`
                                    : `${promo.promotion_value.toLocaleString()}đ`}
                            </div>
                            <div className="col-span-2 text-sm text-gray-600">{promo.expires_at}</div>
                            <div className="col-span-1 text-sm text-gray-600">
                                {promo.is_hidden ? "Yes" : "No"}
                            </div>
                            <div className="col-span-2 flex items-center justify-center space-x-2">
                                <button className="px-2 py-1 bg-yellow-500 text-white rounded">
                                    Edit
                                </button>
                                <button className="px-2 py-1 bg-red-500 text-white rounded">
                                    Delete
                                </button>
                            </div>

                        </div>
                    </div>
                ))}
                {/* Row */}

            </div>
        </div>
    )

};
export default PromotionManagement;
// Vo Lam Thuy Vi
import React, { useState } from "react";
import { Tag } from "phosphor-react";
export default function CreatePromotionModal({
    isOpen,
    onClose,
    onCreate,
    form,
    setForm,
}) {
    const [errors, setErrors] = useState([]);
    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};

        if (!form.code?.trim()) {
            newErrors.code = "Promotion code is required";
        }
        if (!form.description?.trim()) {
            newErrors.description = "Description is required";
        }
        if (!form.promotion_type) {
            newErrors.promotion_type = "Please select a promotion type";
        }
        if (!form.promotion_value || form.promotion_value <= 0) {
            newErrors.promotion_value = "Value must be greater than 0";
        }
        if (!form.expires_at) {
            newErrors.expires_at = "Expiry date is required";
        } else {
            const today = new Date().toISOString().split("T")[0];
            if (form.expires_at < today) {
                newErrors.expires_at = "Expiry date must be in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onCreate(form);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-fade-in-up">
                <h3 className="text-2xl font-extrabold mb-6 text-[#846551] flex items-center gap-2">
                    <Tag size={28} weight="bold" className="text-[#846551]" />
                    Create Promotion
                </h3>

                {/* Form */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Promotion Code
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551] text-gray-800 placeholder-gray-400"
                            type="text"
                            placeholder="e.g. SALE50"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                        />
                        {errors.code && (
                            <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Description
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551] text-gray-800 placeholder-gray-400"
                            type="text"
                            placeholder="Enter description"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Promotion Type
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551] text-gray-800"
                            value={form.promotion_type}
                            onChange={(e) =>
                                setForm({ ...form, promotion_type: e.target.value })
                            }
                        >
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        {errors.promotion_type && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.promotion_type}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Value
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 50"
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551] text-gray-800 placeholder-gray-400"
                            value={form.promotion_value}
                            onChange={(e) =>
                                setForm({ ...form, promotion_value: e.target.value })
                            }
                        />
                        {errors.promotion_value && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.promotion_value}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551] text-gray-800"
                            value={form.expires_at}
                            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                        />
                        {errors.expires_at && (
                            <p className="text-red-500 text-sm mt-1">{errors.expires_at}</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium shadow hover:bg-gray-300 hover:shadow-md transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg bg-[#846551] text-white font-semibold shadow hover:bg-[#6d5142] hover:shadow-lg hover:scale-105 transition-transform duration-300"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

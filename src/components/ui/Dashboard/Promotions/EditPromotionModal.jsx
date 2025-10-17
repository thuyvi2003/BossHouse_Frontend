import React, { useState } from "react";
import { Tag } from "phosphor-react";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";

export default function EditPromotionModal({ isOpen, onClose, onEdit, form, setForm }) {
    const [errors, setErrors] = useState({});
    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.description?.trim()) newErrors.description = "Description is required";
        if (!form.promotion_value || form.promotion_value <= 0)
            newErrors.promotion_value = "Value must be greater than 0";
        if (form.promotion_type === "percent") {
            if (form.promotion_value <= 0 || form.promotion_value >= 100) {
                newErrors.promotion_value = "Percent value must be between 0 and 100";
            }
        }
        if (!form.expires_at) newErrors.expires_at = "Expiry date is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onEdit(form);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-fade-in-up">
                <h3 className="text-2xl font-extrabold mb-6 text-[#846551] flex items-center gap-2">
                    <Tag size={28} weight="bold" className="text-[#846551]" />
                    Edit Promotion
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Code
                        </label>
                        <input
                            type="text"
                            readOnly
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg 
             focus:ring-0 text-gray-500 bg-gray-100 cursor-not-allowed"
                            value={form.code}

                        />

                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] text-gray-800"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Type
                        </label>
                        <input
                            type="text"
                            readOnly
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg 
             focus:ring-0 text-gray-500 bg-gray-100 cursor-not-allowed capitalize"
                            value={form.promotion_type}

                        />

                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Value
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] text-gray-800"
                            value={form.promotion_value}
                            onChange={(e) => setForm({ ...form, promotion_value: e.target.value })}
                        />
                        {errors.promotion_value && <p className="text-red-500 text-sm">{errors.promotion_value}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#846551] mb-1">
                            Expiry Date
                        </label>
                        <DatePicker
                            selected={form.expires_at ? parseISO(form.expires_at) : null}
                            onChange={(date) => {
                                if (date) {
                                    setForm({ ...form, expires_at: format(date, "yyyy-MM-dd") });
                                } else {
                                    setForm({ ...form, expires_at: "" });
                                }
                            }}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="dd/mm/yyyy"
                            minDate={new Date()}
                            className="w-full px-4 py-2 border border-[#d7cbbf] rounded-lg focus:ring-2 focus:ring-[#846551] text-gray-800"
                        />
                        {errors.expires_at && <p className="text-red-500 text-sm">{errors.expires_at}</p>}
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium shadow hover:bg-gray-300 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg bg-[#846551] text-white font-semibold shadow hover:bg-[#6d5142] hover:scale-105 transition-transform duration-300"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

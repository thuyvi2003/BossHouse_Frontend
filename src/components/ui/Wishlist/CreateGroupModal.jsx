//Vo Lam Thuy Vi
import React, { useState } from "react";
import { X } from "lucide-react";
import { createWishlistGroup } from "@/services/wishListService";
import Toast from "@/components/Layout/Toast";

const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); //Ko reload lai trang
    try {
      setLoading(true);
      const res = await createWishlistGroup(form.name, form.description);
      setToast({
        type: "success",
        title: "Success",
        message: "Wishlist group created successfully!",
      });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setToast({
        type: "error",
        title: "Failed",
        message: err.response?.data?.message || "Could not create group",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-[400px] shadow-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-[#5a4639] mb-6">
          Create Wishlist Group
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#5a4639] mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter group name"
              className="w-full border border-[#d7cbbf] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#846551] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5a4639] mb-1">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description..."
              rows="3"
              className="w-full border border-[#d7cbbf] rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-[#846551] outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-[#846551] text-white py-2 rounded-lg font-medium hover:scale-105 transition-transform disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>

        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CreateGroupModal;

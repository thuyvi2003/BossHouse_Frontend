import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getWishlistGroups, moveToGroup } from "@/services/wishListService";
import Toast from "@/components/Layout/Toast";


const SelectGroupModal = ({ wishlistId, onClose, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [toast, setToast] = useState(null);


  useEffect(() => {
    (async () => {
      try {
        const res = await getWishlistGroups();
        if (res.status === "success") setGroups(res.data);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 const handleConfirm = async () => {
  if (!selected) {
    setToast({
      type: "warning",
      title: "Notice",
      message: "Please select a group before confirming.",
    });
    return;
  }

  try {
    const res = await moveToGroup(wishlistId, selected);

    if (res.status === "success") {
      setToast({
        type: "success",
        title: "Success",
        message: res.message || "Item moved to group successfully!",
      });
      onSuccess(res.message);
      onClose();
    } else {
      setToast({
        type: "error",
        title: "Failed",
        message: res.message || "Failed to move item to group.",
      });
    }
  } catch (err) {
    console.error("Move failed:", err);
    const message =
      err.response?.data?.message || "Failed to move item to group.";
    setToast({
      type: "error",
      title: "Error",
      message,
    });
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-[#5a4639] mb-4">
          Select Group
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            You haven’t created any groups yet.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {groups.map((g) => (
              <label
                key={g._id}
                className={`block border px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  selected === g._id
                    ? "bg-[#f5f3f2] border-[#846551]"
                    : "border-[#e5ddd3] hover:bg-[#faf8f6]"
                }`}
              >
                <input
                  type="radio"
                  name="group"
                  value={g._id}
                  checked={selected === g._id}
                  onChange={() => setSelected(g._id)}
                  className="mr-2"
                />
                {g.name}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border border-[#d7cbbf] text-[#5a4639] px-4 py-2 rounded-lg hover:bg-[#f5f3f2]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-[#846551] text-white px-4 py-2 rounded-lg hover:shadow-md hover:scale-105 transition-all"
          >
            Move
          </button>
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
    </div>
  );
};

export default SelectGroupModal;

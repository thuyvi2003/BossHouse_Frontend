// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import CreatePromotionModal from "./CreatePromotionModal";
import { createPromotion, getPromotionsList, removePromotion } from "@/services/promotionService";
import { Tag } from "phosphor-react";
import Pagination from "@/components/Layout/Pagination";
import dayjs from "dayjs";
import ConfirmDialog from "@/components/Layout/ConfirmDialog";
import Toast from "@/components/Layout/Toast";

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const [form, setForm] = useState({
    code: "",
    description: "",
    promotion_type: "percent",
    promotion_value: "",
    expires_at: "",
    is_hidden: false,
  })



  async function fetchData(pageNum = 1) {
    try {
      const data = await getPromotionsList(pageNum, limit, search, status);
      setPromotions(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pageNum)
    } catch (err) {
      console.error("Error fetching promotions:", err.message);
    }
  }
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, status]);




  const handleCreatePromotion = async (newForm) => {
    try {
      const newPromo = await createPromotion({
        ...newForm,
        promotion_value: Number(newForm.promotion_value),
      })
      await fetchData();
      console.log("Created promotion:", newPromo);
      setShowModal(false)
      setForm({
        code: "",
        description: "",
        promotion_type: "percent",
        promotion_value: "",
        expires_at: "",
        is_hidden: false,
      });

    } catch (error) {
      console.error("Error creating promotion:", error.message)
    }
  }
  //Open Confirm dialog
  const handleDeleteClick = (promo) => {
    setSelectedPromo(promo);
    setConfirmOpen(true)
  }
  const handleConfirmDelete = async () => {
    try {
      if (!selectedPromo?._id) return;//Neu chua chon promotion nao thi thoat
      console.log("Deleting promotion:", selectedPromo._id);//Goi API voi id 
      await removePromotion(selectedPromo._id);
      setToast({ show: true, type: "success", message: "Promotion removed successfully!" });
      console.log("Promotion is remove succesfully");
      setConfirmOpen(false);
      setSelectedPromo(null);
      await fetchData(page);//Fetch data load lai ds promotion
    } catch (error) {
      setToast({ show: true, type: "error", message: "Failed to remove promotion!" });
    }
  }
  return (

    <div className="bg-white  shadow-xl overflow-hidden flex-1  animate-fade-in">
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Tag size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Promotion Management
          </span>
        </h2>
        <div className="flex items-center gap-4 p-4 ">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-[#846551] focus:border-[#846551]"
          />

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-[#846551]"
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Hidden</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          + Create Promotion
        </button>


      </div>

      <div className="overflow-x-hidden overflow-y-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-13 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
          <div className="col-span-1">STT</div>
          <div className="col-span-2">Code</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Value</div>
          <div className="col-span-2">Expires At</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-transparent min-h-[650px]">
          {promotions.map((promo, idx) => (
            <div
              key={promo._id || `promo-${idx}`}
              className={`
       relative px-6 py-5 grid grid-cols-13 gap-4 items-center
    bg-white rounded-xl shadow-sm border border-gray-100
    hover:border-[#846551] hover:shadow-lg hover:scale-[1.01]
    transition-all duration-300 ease-in-out
    animate-fade-in-up
      `}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              {/* Decorative left bar */}
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>
              <div className="col-span-1 font-semibold text-gray-700"> {(page - 1) * limit + idx + 1} </div>
              <div className="col-span-2 font-semibold text-gray-900">{promo.code}</div>
              <div className="col-span-3 text-sm text-gray-600">{promo.description}</div>
              <div className="col-span-1 text-sm capitalize text-gray-500">{promo.promotion_type}</div>
              <div className="col-span-1 text-sm text-gray-800 font-semibold">
                {promo.promotion_type === "percent"
                  ? `${promo.promotion_value}%`
                  : `${(promo.promotion_value ?? 0).toLocaleString()}đ`}
              </div>
              <div className="col-span-2 text-sm text-gray-600">{promo.expires_at ? dayjs(promo.expires_at).format("DD/MM/YYYY") : ""}</div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${promo.is_hidden
                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                    : "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                    }`}
                >
                  {promo.is_hidden ? "Hidden" : "Active"}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleDeleteClick(promo)}
                  className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300">
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => fetchData(newPage)}
      />

      {/* Modal */}
      <CreatePromotionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreatePromotion}
        form={form}
        setForm={setForm}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete promotion "${selectedPromo?.code}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
     {toast.show && (
  <Toast
    type="success"
    title="Payment processed"
    message="Transaction ID: #14402"
    onClose={() => setToast({ ...toast, show: false })}
  />
)}



    </div>
  );
};

export default PromotionManagement;

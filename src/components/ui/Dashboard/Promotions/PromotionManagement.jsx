// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import CreatePromotionModal from "./CreatePromotionModal";
import { createPromotion, getPromotionsList, removePromotion, searchPromotions, updatePromotion } from "@/services/promotionService";
import { Tag } from "phosphor-react";
import Pagination from "@/components/Layout/Pagination";
import dayjs from "dayjs";
import ConfirmDialog from "@/components/Layout/ConfirmDialog";
import Toast from "@/components/Layout/Toast";
import PromotionDetailModal from "./PromotionDetailModal";
import EditPromotionModal from "./EditPromotionModal";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
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
      let data
      if (search || status) {
        data = await searchPromotions(search, status);
        setPromotions(data.data || []);
        setTotalPages(1);
        setPage(1);
      } else {
        const data = await getPromotionsList(pageNum, limit);
        setPromotions(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setPage(pageNum)
      }
    }

    catch (err) {
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

  //Open promotion detail
  const handleViewDetail = (promo) => {
    setSelectedPromo(promo);
    setDetailOpen(true);
  }
  //Open Confirm dialog
  const handleDeleteClick = (promo) => {
    setSelectedPromo(promo);
    setConfirmOpen(true)
  }
  //Open Edit form
  const handleEditClick = (promo) => {
    setSelectedPromo(promo);
    setForm({
      code: promo.code || "",
      description: promo.description || "",
      promotion_type: promo.promotion_type || "",
      promotion_value: promo.promotion_value || "",
      expires_at: promo.expires_at || "",
    })
    setEditModalOpen(true)
  }

  const handleEditPromotion = async () => {
    try {
      if (!selectedPromo?._id) return;
      await updatePromotion(selectedPromo._id, {
        description: form.description,
        promotion_value: Number(form.promotion_value),
        expires_at: form.expires_at ? dayjs(form.expires_at).format("YYYY-MM-DD") : "",
      });
      setToast({ show: true, type: "success", message: "Promotion updated successfully!" });
      setEditModalOpen(false);
      setSelectedPromo(null);
      await fetchData();
    } catch (error) {
      console.error("Error updating promotion:", error);
      setToast({ show: true, type: "error", message: "Failed to update promotion!" });
    }
  };

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
        <div className="flex items-center gap-4 p-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search promotion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-[#c8b7a6] rounded-lg bg-[#faf8f6]
                 text-gray-700 placeholder-gray-400
                 focus:ring-2 focus:ring-[#846551] focus:border-[#846551]
                 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 w-5 h-5 text-[#846551]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>

          {/* Filter dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-[#c8b7a6] rounded-lg bg-[#faf8f6]
               text-gray-700 cursor-pointer
               focus:ring-2 focus:ring-[#846551] focus:border-[#846551]
               transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
          >
            <option value="">All Status</option>
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
                  onClick={() => handleViewDetail(promo)}
                  className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f3ece9] transition-all duration-300"
                >
                  View
                </button>
                <button
                  onClick={() => handleEditClick(promo)}
                  className="px-3 py-1 border border-[#5a4639] text-[#5a4639] rounded-lg hover:bg-[#ebe2da] transition-all duration-300"
                >
                  Edit
                </button>
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


      <PromotionDetailModal
        isOpen={detailOpen}
        promotion={selectedPromo}
        onClose={() => setDetailOpen(false)} />


      <EditPromotionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={handleEditPromotion}
        form={form}
        setForm={setForm} />

      {toast.show && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}



    </div>
  );
};

export default PromotionManagement;

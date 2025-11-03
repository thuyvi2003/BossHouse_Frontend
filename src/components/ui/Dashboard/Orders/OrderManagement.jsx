// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Package } from "phosphor-react";
import { getAllOrders } from "@/services/orderService";
import Pagination from "@/components/Layout/Pagination";
import ConfirmDialog from "@/components/Layout/ConfirmDialog";
import Toast from "@/components/Layout/Toast";
// import OrderDetailModal from "./OrderDetailModal";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  // Fetch orders
  async function fetchOrders(pageNum = 1) {
    try {
      const data = await getAllOrders(pageNum, limit);
      console.log("Fetched orders:", data.orders);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    }
  }

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  // Delete order
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setConfirmOpen(true);
  };

//   const handleConfirmDelete = async () => {
//     try {
//       if (!selectedOrder?._id) return;
//       await removeOrder(selectedOrder._id);
//       setToast({ show: true, type: "success", message: "Order removed successfully!" });
//       setConfirmOpen(false);
//       setSelectedOrder(null);
//       await fetchOrders(page);
//     } catch (error) {
//       setToast({ show: true, type: "error", message: "Failed to remove order!" });
//     }
//   };

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Package size={22} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Order Management
          </span>
        </h2>

        <div className="flex items-center gap-4 p-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search order by user name..."
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
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipping">Shipping</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-hidden overflow-y-hidden">
        <div className="grid grid-cols-13 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
          <div className="col-span-1">#</div>
          <div className="col-span-2">User</div>
          <div className="col-span-2">Items</div>
          <div className="col-span-2">Final Price</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-2">Created At</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        <div className="divide-y divide-transparent min-h-[650px]">
  {orders.length === 0 ? (
    <div className="flex items-center justify-center h-[300px] text-gray-500 text-xl italic">
      No orders found.
    </div>
  ) : (
    orders.map((order, idx) => (
      <div
        key={order._id || `order-${idx}`}
        className="relative px-6 py-5 grid grid-cols-13 gap-4 items-center
                   bg-white rounded-xl shadow-sm border border-gray-100
                   hover:border-[#846551] hover:shadow-lg hover:scale-[1.01]
                   transition-all duration-300 ease-in-out animate-fade-in-up"
        style={{ animationDelay: `${idx * 100}ms` }}
      >
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>
        <div className="col-span-1 font-semibold text-gray-700">{(page - 1) * limit + idx + 1}</div>
        <div className="col-span-2 text-gray-800 font-medium">{order.shipping_address?.name || "N/A"}</div>
        <div className="col-span-2 text-sm text-gray-600">
          {order.items?.slice(0, 2).map((it, i) => (
            <div key={i}>• {it.product_name} x{it.quantity}</div>
          ))}
          {order.items?.length > 2 && (
            <div className="text-xs text-gray-400">+{order.items.length - 2} more</div>
          )}
        </div>
        <div className="col-span-2 text-sm font-semibold text-[#5a4639]">
          {order.final_price?.toLocaleString()}đ
        </div>
        <div className="col-span-1">
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${
              order.status === "completed"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.status}
          </span>
        </div>
        <div className="col-span-1 text-sm text-gray-700">{order.payment_method}</div>
        <div className="col-span-2 text-sm text-gray-600">
          {dayjs(order.created_at).format("DD/MM/YYYY")}
        </div>

        <div className="col-span-2 flex items-center justify-center space-x-3">
          <button
            onClick={() => handleViewDetail(order)}
            className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f3ece9] transition-all duration-300"
          >
            View
          </button>
        </div>
      </div>
    ))
  )}
</div>

      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => fetchOrders(newPage)} />

      {/* Detail Modal */}
      {/* <OrderDetailModal isOpen={detailOpen} order={selectedOrder} onClose={() => setDetailOpen(false)} /> */}

      {/* Confirm Delete */}
      {/* <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete order of "${selectedOrder?.shipping_address?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      /> */}

      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default OrderManagement;

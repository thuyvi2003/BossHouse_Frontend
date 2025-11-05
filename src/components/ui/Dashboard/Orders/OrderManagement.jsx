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
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  // const [confirmOpen, setConfirmOpen] = useState(false);
  // const [selectedOrder, setSelectedOrder] = useState(null);
  // const [detailOpen, setDetailOpen] = useState(false);

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

  // const handleViewDetail = (order) => {
  //   setSelectedOrder(order);
  //   setDetailOpen(true);
  // };

  // Delete order
  // const handleDeleteClick = (order) => {
  //   setSelectedOrder(order);
  //   setConfirmOpen(true);
  // };

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
    <div className="flex-1 ">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 rounded-t-[2.5rem] bg-[#d8ccbf]/85 px-8 py-6 shadow-inner shadow-[#1a1a16]/15 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          {/* Icon container */}
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b5a3c]/95 text-[#f5f3f0] shadow-lg shadow-[#1a1a16]/20">
            <Package size={24} weight="fill" />
          </span>

          {/* Title + Subtitle */}
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-[0.28em] text-[#1a1a16]">
              Order Management
            </h2>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8b5a3c]">
              Manage customer orders
            </p>
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search order by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-xl border border-[#8b5a3c]/40 bg-[#f5f3f0] px-10 py-2 text-sm font-medium text-[#1a1a16] placeholder:text-[#8b5a3c]/60 shadow-inner shadow-[#1a1a16]/10 transition-all duration-300 ease-in-out focus:border-[#8b5a3c] focus:outline-none focus:ring-2 focus:ring-[#8b5a3c]/40 hover:shadow-lg hover:shadow-[#1a1a16]/15"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-[#8b5a3c]"
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
            className="cursor-pointer rounded-xl border border-[#8b5a3c]/40 bg-[#f5f3f0] px-4 py-2 text-sm font-semibold text-[#1a1a16] shadow-inner shadow-[#1a1a16]/10 transition-all duration-300 ease-in-out focus:border-[#8b5a3c] focus:outline-none focus:ring-2 focus:ring-[#8b5a3c]/40 hover:shadow-lg hover:shadow-[#1a1a16]/15"
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
      <div className="">
        <div className="grid grid-cols-13 gap-4 border-b  bg-[#f5f3f0] px-6 py-3 text-sm  font-extrabold uppercase tracking-[0.25em] text-[#8a7262]  shadow-inner shadow-[#1a1a16]/30">
          <div className="col-span-1">#</div>
          <div className="col-span-2">User</div>
          <div className="col-span-2">Items</div>
          <div className="col-span-2">Final Price</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-2">Created At</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        <div className="min-h-[650px] divide-y divide-transparent">
          {orders.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-xl italic text-[#1a1a16]/60">
              No orders found.
            </div>
          ) : (
            orders.map((order, idx) => (
              <div
                key={order._id || `order-${idx}`}
                className="relative grid grid-cols-13 items-center gap-6  border border-[#d8ccbf] bg-[#f5f3f0]/90 px-6 py-5 shadow-[0_22px_45px_-24px_rgba(26,26,22,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#8b5a3c] hover:shadow-[0_32px_60px_-20px_rgba(26,26,22,0.45)] animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-3xl bg-[#d8ccbf] transition-colors duration-300 hover:bg-[#8b5a3c]" />
                <div className="col-span-1 font-semibold text-[#1a1a16]">{(page - 1) * limit + idx + 1}</div>
                <div className="col-span-2 font-semibold text-[#1a1a16]">{order.shipping_address?.name || "N/A"}</div>
                <div className="col-span-2 text-sm text-[#1a1a16]/80">
                  {order.items?.slice(0, 2).map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[#8b5a3c]">-</span>
                      <span>
                        {it.product_name} x{it.quantity}
                      </span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <div className="text-xs font-semibold text-[#8b5a3c]">+{order.items.length - 2} more</div>
                  )}
                </div>
                <div className="col-span-2 text-sm font-semibold text-[#8b5a3c]">
                  {order.final_price?.toLocaleString()} VND
                </div>
                <div className="col-span-1">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-inner shadow-[#1a1a16]/10 ${order.status === "completed"
                        ? "bg-[#8b5a3c]/20 text-[#8b5a3c]"
                        : order.status === "cancelled"
                          ? "bg-[#1a1a16]/15 text-[#1a1a16]"
                          : "bg-[#d8ccbf]/70 text-[#1a1a16]"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="col-span-1 text-sm font-semibold text-[#1a1a16]">{order.payment_method}</div>
                <div className="col-span-2 text-sm text-[#1a1a16]/75">
                  {dayjs(order.created_at).format("DD/MM/YYYY")}
                </div>

                <div className="col-span-2 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => handleViewDetail(order)}
                    className="rounded-xl border border-[#8b5a3c] px-3 py-1 text-sm font-semibold text-[#8b5a3c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8b5a3c] hover:text-[#f5f3f0] hover:shadow-lg hover:shadow-[#1a1a16]/20"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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

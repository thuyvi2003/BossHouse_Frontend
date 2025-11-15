// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Package } from "phosphor-react";
import {
  getAllOrders,
  searchOrders,
  updateOrderStatus,
  cancelOrder,
} from "@/services/orderService";
import Pagination from "@/components/Layout/Pagination";
import ConfirmDialog from "@/components/Layout/ConfirmDialog";
import Toast from "@/components/Layout/Toast";
import OrderDetailModal from "./OrderDetailModal";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);

  // Fetch orders
  async function fetchOrders(page = 1) {
    try {
      const data = await searchOrders(search, status, page, limit);

      console.log("Fetched orders:", data.orders);

      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setPage(page);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, status]);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    const previous = orders;
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast({
        show: true,
        type: "success",
        message: "Order status updated",
      });
    } catch (err) {
      // revert on error
      setOrders(previous);
      setToast({
        show: true,
        type: "error",
        message: "Failed to update status",
      });
      console.error("Update status error:", err);
    }
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setConfirmType("cancel");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    if (confirmType === "cancel") {
      try {
        await cancelOrder(selectedOrder._id);
        setToast({ show: true, type: "success", message: "Order cancelled" });
        setConfirmOpen(false);
        setSelectedOrder(null);
        await fetchOrders(page);
      } catch (err) {
        setToast({
          show: true,
          type: "error",
          message: "Failed to cancel order",
        });
        console.error("Cancel order error:", err);
      }
    }
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
    <div className="flex-1">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf] rounded-t-md">
        <div className="flex items-center gap-3">
          <span className="text-[#846551] flex items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b5a3c]/95 text-[#f5f3f0] shadow-lg shadow-[#1a1a16]/20">
              <Package size={24} weight="fill" />
            </span>
          </span>

          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
              <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
                Order Management
              </span>
            </h2>
            <p className="text-sm text-gray-700">Manage customer orders</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search order by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-[#c8b7a6] rounded-lg bg-[#faf8f6] text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#846551] focus:border-[#846551] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 w-5 h-5 text-[#846551]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>

          {/* Filter dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-[#c8b7a6] rounded-lg bg-[#faf8f6] text-gray-700 cursor-pointer focus:ring-2 focus:ring-[#846551] focus:border-[#846551] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
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
            <div className="flex h-[300px] items-center justify-center text-xl italic text-[#1a1a16]/60">
              No orders found.
            </div>
          ) : (
            orders.map((order, idx) => (
              <div
                key={order._id || `order-${idx}`}
                className={`relative px-6 py-5 grid grid-cols-13 gap-4 items-center bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#846551] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-in-out animate-fade-in-up`}
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>
                <div className="col-span-1 font-semibold text-[#1a1a16]">
                  {(page - 1) * limit + idx + 1}
                </div>
                <div className="col-span-2 font-semibold text-[#1a1a16]">
                  {order.shipping_address?.name || "N/A"}
                </div>
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
                    <div className="text-xs font-semibold text-[#8b5a3c]">
                      +{order.items.length - 2} more
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-sm font-semibold text-[#8b5a3c]">
                  {order.final_price?.toLocaleString()} VND
                </div>
                <div className="col-span-1">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-inner shadow-[#1a1a16]/10 ${
                      order.status === "completed"
                        ? "bg-[#8b5a3c]/20 text-[#8b5a3c]"
                        : order.status === "cancelled"
                        ? "bg-[#1a1a16]/15 text-[#1a1a16]"
                        : "bg-[#d8ccbf]/70 text-[#1a1a16]"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="col-span-1 text-sm font-semibold text-[#1a1a16]">
                  {order.payment_method}
                </div>
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
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="rounded-xl border px-2 py-1 text-sm"
                      disabled={
                        order.status === "completed" ||
                        order.status === "cancelled"
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipping">Shipping</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Admins cannot cancel customers' orders from this view; only users can cancel their own orders */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => fetchOrders(newPage)}
      />

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={detailOpen}
        order={selectedOrder}
        onClose={() => setDetailOpen(false)}
      />

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

      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmType === "cancel" ? "Confirm Cancel" : "Confirm"}
        message={
          confirmType === "cancel"
            ? `Are you sure you want to cancel order of "${selectedOrder?.shipping_address?.name}"?`
            : "Are you sure?"
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default OrderManagement;

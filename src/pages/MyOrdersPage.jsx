// Vo Lam Thuy Vi - MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import Pagination from "@/components/Layout/Pagination";
import OrderTabs from "@/components/ui/Orders/OrderTabs";
import OrderDetailModal from "@/components/ui/Orders/OrderDetailModal";
import OrderCard from "@/components/ui/Orders/OrderCard";


export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (status = "all", pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getMyOrders(pageNum, limit, status);
      console.log("My order history", res.data)
      if (res.status === "success") {
        setOrders(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter, 1);
  }, [statusFilter]);

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading orders...</div>;

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-2xl font-semibold text-[#5a4639] mb-6">
          My Orders
        </h1>

        <OrderTabs active={statusFilter} onChange={setStatusFilter} />

        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm mt-6">No orders found.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetail={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchOrders(statusFilter, p)}
          />
        </div>

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}

// Vo Lam Thuy Vi - src/pages/MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import dayjs from "dayjs";
import Pagination from "@/components/Layout/Pagination";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const fetchOrders = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await getMyOrders(pageNum, limit);
            if (res.status === "success") {
                setOrders(res.data);
                setTotalPages(res.pagination?.totalPages || 1);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setToast({
                type: "error",
                title: "Failed!",
                message:
                    error.response?.data?.message || "Failed to load your orders.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);


    if (loading)
        return <div className="text-center py-10 text-gray-500">Loading orders...</div>;

    return (
        <div className="min-h-screen  py-10">
            <div className="max-w-10xl mx-auto p-8">
                <h1 className="text-2xl font-semibold text-[#5a4639] mb-6">
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">You have no orders yet.</p>
                ) : (
                    <div className="space-y-6  ">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="border rounded-lg p-4 hover:shadow-md transition bg-white"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="font-semibold text-[#846551]">
                                            Order ID: {order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Date: {dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm px-3 py-1 rounded-full ${order.status === "completed"
                                            ? "bg-green-100 text-green-700"
                                            : order.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <strong>Items:</strong>
                                    <ul className="list-disc ml-6 text-sm text-gray-600">
                                        {order.items.map((i) => (
                                            <li key={i._id || i.product_name}>
                                                {i.product_name} <span className="text-gray-500">x{i.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p>
                                        <strong>Total:</strong>{" "}
                                        {order.final_price.toLocaleString("vi-VN")}đ
                                    </p>
                                    <p>
                                        <strong>Payment:</strong> {order.payment_method}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             
            </div>
               <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => fetchOrders(p)}
                />
        </div>
    );
}

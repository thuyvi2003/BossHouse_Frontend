import React from "react";
import dayjs from "dayjs";
import { Tag, Calendar, Info, Coins, Package } from "phosphor-react";

const statusColor = (status) => {
  switch (status) {
    case "completed":
      return "from-green-100 to-green-200 text-green-700";
    case "cancelled":
      return "from-red-100 to-red-200 text-red-700";
    default:
      return "from-yellow-100 to-yellow-200 text-yellow-700";
  }
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex justify-between items-center border-b border-[#e5d8cd] pb-2">
    <div className="flex items-center gap-2 text-[#846551]">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-gray-800 font-semibold">{value}</span>
  </div>
);

const OrderDetailModal = ({ isOpen, order, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-fade-in-up relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f1ebe7] to-[#d7cbbf] opacity-30 pointer-events-none"></div>

        <div className="relative flex items-center gap-3 mb-6">
          <Package size={28} weight="bold" className="text-[#846551]" />
          <h3 className="text-2xl font-extrabold text-[#846551] drop-shadow-sm">
            Order Detail
          </h3>
        </div>

        <div className="relative space-y-4">
          <DetailRow
            icon={<Info size={20} className="text-[#846551]" />}
            label="Order ID"
            value={order._id}
          />
          <DetailRow
            icon={<Calendar size={20} className="text-[#846551]" />}
            label="Created At"
            value={dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
          />
          <DetailRow
            icon={<Coins size={20} className="text-[#846551]" />}
            label="Final Price"
            value={`${order.final_price?.toLocaleString()} VND`}
          />
          <DetailRow
            icon={<Info size={20} className="text-[#846551]" />}
            label="Shipping Address"
            value={`${order.shipping_address?.address || ""}, ${
              order.shipping_address?.ward || ""
            }, ${order.shipping_address?.district || ""}, ${
              order.shipping_address?.province || ""
            }, ${order.shipping_address?.country || ""}`}
          />
          <DetailRow
            icon={<Tag size={20} className="text-[#846551]" />}
            label="Promotion"
            value={
              order.promotion_id ? order.promotion_id.code : "No Promotion"
            }
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium text-[#846551]">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${statusColor(
                order.status
              )} shadow`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Items</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1ebe7]">
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-8">
                  #
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-20">
                  Image
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-40">
                  Product Name
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-32">
                  Variation
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-16 text-center">
                  Quantity
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-24 text-right">
                  Price
                </th>
                <th className="border-b py-3 px-4 text-sm font-semibold text-[#846551] w-24 text-right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} className="hover:bg-[#f9f5f1]">
                  <td className="py-3 px-4 text-sm text-[#1a1a16] text-center">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <img
                      src={item.variation_id?.image || "/placeholder.png"}
                      alt={
                        item.variation_id?.product_id?.name || "Product Image"
                      }
                      className="w-16 h-16 object-cover rounded border border-[#e5d8cd]"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-[#1a1a16] font-medium">
                    {item.variation_id?.product_id?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#1a1a16]">
                    {item.variation_id?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#1a1a16] text-center">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#1a1a16] text-right">
                    {item.price.toLocaleString()} VND
                  </td>
                  <td className="py-3 px-4 text-sm text-[#1a1a16] text-right">
                    {item.subtotal.toLocaleString()} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#846551] text-white font-semibold shadow hover:bg-[#6d5142] hover:scale-105 transition-transform duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
